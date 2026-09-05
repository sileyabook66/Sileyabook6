import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { countChapterWords, calculateChapterA5Pages, getChapterMetrics, splitChapterIfExceedsLimit, analyzeChapterDuplication } from "./src/lib/textStructure";
import { generateCalibratedSubstantiveChapter } from "./src/lib/calibratedGenerator";

dotenv.config({ quiet: true });

// Minimal service-role Supabase REST/Auth client, implemented as plain
// fetch() calls instead of @supabase/supabase-js. The SDK constructs a
// Realtime client eagerly, which requires a native global WebSocket that
// doesn't exist on Node <22 — a real problem here, but only server-side
// (browsers have native WebSocket, so src/lib/supabaseClient.ts is fine
// using the real SDK). We only need auth verification, simple selects,
// one RPC call and one insert, so plain REST calls are simpler than
// fighting the SDK's Realtime bootstrapping.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = {
  async getUserFromToken(token: string): Promise<{ id: string } | null> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_ROLE_KEY },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? { id: user.id } : null;
  },

  async getProfileCredits(profileId: string): Promise<number | null> {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(profileId)}&select=credits_pages`,
      { headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, apikey: SERVICE_ROLE_KEY } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.credits_pages ?? null;
  },

  async applyCreditTransaction(params: {
    profileId: string;
    montant: number;
    type: string;
    ebookId?: string | null;
    description?: string;
  }): Promise<any> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_credit_transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_profile_id: params.profileId,
        p_montant: params.montant,
        p_type: params.type,
        p_ebook_id: params.ebookId || null,
        p_description: params.description || null,
      }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `apply_credit_transaction a échoué (${res.status})`);
    }
    return res.json();
  },

  async insertGenerationLog(row: Record<string, any>): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/generation_logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Erreur enregistrement generation_log (non bloquant) :", errText);
    }
  },
};

// Extracts and verifies the bearer JWT from the Authorization header,
// returning the authenticated user's id. Never trust a client-supplied
// profileId for anything that touches credits.
async function getAuthenticatedUserId(req: express.Request): Promise<string | null> {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const user = await supabaseAdmin.getUserFromToken(token);
  return user?.id || null;
}

// Sanitize CLOUDINARY_URL if present but missing the required protocol
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.startsWith("cloudinary://")) {
  delete process.env.CLOUDINARY_URL;
}

let cloudinaryClientInstance: any = null;

async function getCloudinaryClient() {
  if (!cloudinaryClientInstance) {
    const { v2 } = await import("cloudinary");
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://")) {
      v2.config({ cloudinary_url: cloudinaryUrl });
    } else if (cloudName && apiKey && apiSecret) {
      v2.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
        secure: true,
      });
    }
    cloudinaryClientInstance = v2;
  }
  return cloudinaryClientInstance;
}

function getCloudinaryConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasValidUrl = Boolean(cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://"));
  const hasValidCreds = Boolean(cloudName && apiKey && apiSecret);
  const isConfigured = hasValidUrl || hasValidCreds;

  return {
    isConfigured,
    cloudName: cloudName || (hasValidUrl ? "configured-via-url" : null),
  };
}

function getGeminiStudioClient() {
  // Use dedicated GEMINI_API_KEY_STUDIO or fallback to GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY_STUDIO || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MY_GEMINI_API_KEY_STUDIO") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Shared anti-generic / anti-fabrication rules, injected into every prompt
// that asks Gemini to write chapter body content (main book generation,
// single-chapter regeneration, and the manual "add chapter" endpoint).
// Added after diagnosing that generated books could come back with
// fabricated fictional-company case studies (invented statistics like
// "42% de dégradation sur 18 mois") and identical section structure across
// chapters — the model was never explicitly told not to invent examples,
// and had no chapter-specific factual material to draw from besides a title.
const ANTI_FABRICATION_RULES = `RÈGLES ANTI-GÉNÉRICITÉ ET ANTI-FABRICATION (STRICTES) :
- INTERDICTION ABSOLUE d'inventer une entreprise fictive et son étude de cas (ex : "l'entreprise X a réduit ses coûts de Y % en Z mois"). N'invente aucun nom d'organisation, aucune statistique, aucun pourcentage, aucune durée chiffrée qui ne provienne pas explicitement de la source fournie.
- Si tu n'as aucun fait vérifiable à citer pour illustrer une idée, n'utilise PAS d'exemple chiffré : développe l'idée elle-même en profondeur (mécanisme, raisonnement, implication pratique) plutôt que de fabriquer un cas.
- Si tu cites un exemple concret, il doit soit provenir directement du contenu source fourni, soit être un cas réel, public et identifiable (personnalité, entreprise ou évènement connu) — jamais un cas anonyme ou inventé présenté comme réel.
- N'utilise PAS la même structure de sections, les mêmes intitulés, ni les mêmes tournures de phrases d'un chapitre à l'autre : chaque chapitre doit être organisé selon ce que son propre sujet appelle naturellement, pas selon un gabarit fixe recopié.
- Le contenu de chaque chapitre doit être écrit spécifiquement pour SON sujet exact (titre + description ci-dessous), en s'appuyant sur la matière fournie par l'utilisateur — ne rédige pas un texte générique qui pourrait être recyclé tel quel pour n'importe quel autre sujet en changeant seulement quelques mots.`;

const SINGLE_CHAPTER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    titre: { type: Type.STRING },
    resume: { type: Type.STRING },
    objectifs: { type: Type.ARRAY, items: { type: Type.STRING } },
    points_cles: { type: Type.ARRAY, items: { type: Type.STRING } },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          titre: { type: Type.STRING },
          sous_titre: { type: Type.STRING },
          paragraphes: { type: Type.ARRAY, items: { type: Type.STRING } },
          callout: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              content: { type: Type.STRING },
              author: { type: Type.STRING },
            },
          },
        },
        required: ["titre", "paragraphes"],
      },
    },
    conclusion_chapitre: { type: Type.STRING },
  },
  required: ["titre", "resume", "sections", "conclusion_chapitre"],
};

const GEMINI_MODELS_TO_TRY = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"];

// Generates (or regenerates) a single chapter's content through Gemini,
// grounded in its specific plan title/description and the book's real
// source material rather than the title alone. Returns null if every
// model attempt fails, letting the caller fall back to the static
// template generator as a last resort instead of the first resort.
// Real Gemini calls for a ~2500-word structured chapter routinely take
// 25-70+ seconds (confirmed via direct timing) — a prior 12s timeout on
// the single-chapter endpoint meant every model attempt failed by design,
// silently forcing 100% of individually-added chapters into the static
// template. Replaced with a realistic 60s-per-model timeout here.
async function generateChapterContentWithGemini(
  ai: any,
  params: {
    subject: string;
    contextDescription: string;
    targetAudience?: string;
    writingTone?: string;
    language?: string;
    chapterNumber: number;
  }
): Promise<any | null> {
  if (!ai) return null;

  const chapterSystemPrompt = `Tu es un maître écrivain et architecte éditorial d'exception pour Sileyabook Studio.
CONSIGNES STRICTES DE LONGUEUR ET DE MISE EN PAGE :
1. RÈGLE ÉDITORIALE ABSOLUE : NE génère PAS de résumé de chapitre, NI de citations isolées ou callouts. Le texte doit débuter directement par les sections et paragraphes.
2. Chaque chapitre généré doit contenir environ 2500 mots (entre 2 350 et 2 650 mots au total, ni significativement moins, ni plus).
3. Le calibrage typographique A5 est de 350 mots par page (environ 7 à 7,5 pages A5 par chapitre).
4. Rédige au moins 4 sections substantielles et détaillées, chacune avec 4 à 6 paragraphes denses et documentés.

${ANTI_FABRICATION_RULES}

Langue de rédaction: ${params.language || "Français"}
Public cible: ${params.targetAudience || "Praticiens et passionnés recherchant une maîtrise concrète"}
Tonalité stylistique: ${params.writingTone || "didactique"}`;

  const chapterUserPrompt = `Rédige un chapitre complet sur le sujet précis suivant :
« ${params.subject.trim()} »

Matière et contexte réels à exploiter pour ancrer le chapitre dans des faits spécifiques (ne te limite pas au titre ci-dessus) :
${params.contextDescription}

Respecte impérativement :
- Pas de résumé ni de citations / callouts : rédaction fluide, directe et dense.
- Volume : environ 2 500 mots réels de texte riche et substantiel (tolérance 2 350 à 2 650 mots).
- Structure adaptée spécifiquement à ce sujet, pas un gabarit recopié d'un autre chapitre.

Retourne un objet JSON strictement conforme au schéma.`;

  for (const modelName of GEMINI_MODELS_TO_TRY) {
    try {
      const callPromise = ai.models.generateContent({
        model: modelName,
        contents: chapterUserPrompt,
        config: {
          systemInstruction: chapterSystemPrompt,
          responseMimeType: "application/json",
          maxOutputTokens: 16384,
          responseSchema: SINGLE_CHAPTER_RESPONSE_SCHEMA,
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout de génération avec ${modelName}`)), 60000)
      );
      const resp: any = await Promise.race([callPromise, timeoutPromise]);
      if (resp.text) {
        return JSON.parse(resp.text);
      }
    } catch (modelErr: any) {
      console.warn(`Tentative chapitre avec ${modelName} (${modelErr.status || modelErr.message}), bascule...`);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route: Health check & key status
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/studio/status", (req, res) => {
    const hasDedicatedKey = Boolean(process.env.GEMINI_API_KEY_STUDIO && process.env.GEMINI_API_KEY_STUDIO !== "MY_GEMINI_API_KEY_STUDIO");
    const hasDefaultKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
    const cloudinaryInfo = getCloudinaryConfig();

    res.json({
      status: "online",
      hasDedicatedKey,
      hasDefaultKey,
      keySource: hasDedicatedKey ? "GEMINI_API_KEY_STUDIO" : hasDefaultKey ? "GEMINI_API_KEY" : "none",
      cloudinary: {
        isConfigured: cloudinaryInfo.isConfigured,
        cloudName: cloudinaryInfo.cloudName,
      },
    });
  });

  // API Route: Cloudinary status
  app.get("/api/studio/cloudinary-status", (req, res) => {
    const info = getCloudinaryConfig();
    res.json({
      isConfigured: info.isConfigured,
      cloudName: info.cloudName,
    });
  });

  // In-memory cache of uploaded PDFs for instant live preview/download fallback
  const pdfDownloadsCache = new Map<string, { buffer: Buffer; contentType: string; title: string }>();

  app.get("/api/studio/downloads/:id", (req, res) => {
    const cached = pdfDownloadsCache.get(req.params.id);
    if (!cached) {
      return res.status(404).send("Document non trouvé ou expiré.");
    }
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Content-Disposition", `inline; filename="${cached.title}.pdf"`);
    res.send(cached.buffer);
  });

  // API Route: Upload final PDF to Cloudinary with resource_type: raw
  app.post("/api/studio/upload-pdf", async (req, res) => {
    try {
      const { pdfBase64, ebookId, ebookTitle, authorName, coverTheme } = req.body;

      if (!pdfBase64) {
        return res.status(400).json({ error: "Contenu PDF en base64 requis." });
      }

      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const safeId = (ebookId || `ebk-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");
      const sanitizedTitle = (ebookTitle || "manuscrit").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

      // Store in memory cache for immediate reliable browser access
      pdfDownloadsCache.set(safeId, {
        buffer,
        contentType: "application/pdf",
        title: sanitizedTitle,
      });

      const cloudinaryInfo = getCloudinaryConfig();

      if (cloudinaryInfo.isConfigured) {
        const cloudinary = await getCloudinaryClient();
        // Upload to Cloudinary with resource_type: 'raw' (like livremystique.com for large PDF files)
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "studio_manuscrit/ebooks",
              public_id: `${sanitizedTitle}_${Date.now()}`,
              format: "pdf",
              tags: ["studio_manuscrit", "ebook", safeId],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return res.json({
          success: true,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          bytes: uploadResult.bytes || buffer.length,
          resource_type: "raw",
          mode: "cloudinary",
          uploaded_at: new Date().toISOString(),
        });
      } else {
        // Cloudinary not configured in .env -> generate secure hosted url
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
        const host = req.get("host") || `localhost:${PORT}`;
        const hostedPdfUrl = `${protocol}://${host}/api/studio/downloads/${safeId}`;

        // Also generate standard Cloudinary CDN signature format url for reference
        const cdnDisplayUrl = `https://res.cloudinary.com/studio-manuscrit/raw/upload/v${Date.now()}/studio_manuscrit/ebooks/${sanitizedTitle}.pdf`;

        return res.json({
          success: true,
          secure_url: hostedPdfUrl,
          cdn_url: cdnDisplayUrl,
          public_id: `studio_manuscrit/ebooks/${sanitizedTitle}`,
          bytes: buffer.length,
          resource_type: "raw",
          mode: "hosted_preview",
          note: "Document PDF hébergé et prêt. Pour synchroniser directement avec votre compte Cloudinary en production, définissez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env.",
          uploaded_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Erreur lors du téléversement Cloudinary :", err);
      return res.status(500).json({
        error: "Erreur lors du téléversement vers Cloudinary",
        details: err.message || String(err),
      });
    }
  });

  // In-memory cache for uploaded inline images (fallback when Cloudinary is not configured in .env)
  const imagesDownloadsCache = new Map<string, { buffer: Buffer; contentType: string; filename: string }>();

  app.get("/api/studio/images/:id", (req, res) => {
    const cached = imagesDownloadsCache.get(req.params.id);
    if (!cached) {
      return res.status(404).send("Image non trouvée.");
    }
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(cached.buffer);
  });

  // API Route: Upload inline image to Cloudinary (or local server cache) at cursor insertion time
  app.post("/api/studio/upload-image", async (req, res) => {
    try {
      const { imageBase64, filename = "illustration.jpg", caption = "" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Données image requises (imageBase64)." });
      }

      // Clean base64 prefix
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let contentType = "image/jpeg";

      if (matches && matches.length === 3) {
        contentType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        const clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        buffer = Buffer.from(clean, "base64");
      }

      const safeId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const sanitizedName = filename.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

      // Store in local cache for instant zero-latency serving
      imagesDownloadsCache.set(safeId, {
        buffer,
        contentType,
        filename: sanitizedName,
      });

      const cloudinaryInfo = getCloudinaryConfig();

      if (cloudinaryInfo.isConfigured) {
        const cloudinary = await getCloudinaryClient();
        // Upload to Cloudinary with auto-compression and web-optimized format
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "studio_manuscrit/inline_images",
              public_id: `${sanitizedName}_${Date.now()}`,
              resource_type: "image",
              transformation: [
                { quality: "auto:good", fetch_format: "auto", width: 1600, crop: "limit" },
              ],
              tags: ["studio_manuscrit", "inline_image", safeId],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return res.json({
          success: true,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes || buffer.length,
          caption,
          mode: "cloudinary",
          uploaded_at: new Date().toISOString(),
        });
      } else {
        // Local server hosted URL
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
        const host = req.get("host") || `localhost:${PORT}`;
        const hostedUrl = `${protocol}://${host}/api/studio/images/${safeId}`;

        return res.json({
          success: true,
          secure_url: hostedUrl,
          public_id: safeId,
          bytes: buffer.length,
          caption,
          mode: "hosted_preview",
          uploaded_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de l'upload de l'image :", err);
      return res.status(500).json({
        error: "Erreur lors du téléversement de l'image",
        details: err.message || String(err),
      });
    }
  });

  // Authoritative post-generation bookkeeping: debits the real balance via
  // the apply_credit_transaction RPC (the only way credits_pages can ever
  // change — see supabase/migrations/0001_auth_and_persistence.sql) and
  // writes the generation_logs row. Both tables reject direct client
  // writes via RLS, so this must run with the service-role key.
  async function finalizeGeneration(params: {
    profileId: string;
    pages: number;
    description: string;
    ebookTitre: string;
    sourceType: string;
    sourceDetail: string;
    tokensUsed: number;
    modelUsed: string;
    durationMs: number;
  }) {
    const transaction = await supabaseAdmin.applyCreditTransaction({
      profileId: params.profileId,
      montant: -params.pages,
      type: "generation",
      description: params.description,
    });

    await supabaseAdmin.insertGenerationLog({
      profile_id: params.profileId,
      ebook_titre: params.ebookTitre,
      source_type: params.sourceType,
      source_detail: params.sourceDetail,
      pages_generees: params.pages,
      tokens_utilises: params.tokensUsed,
      model_used: params.modelUsed,
      duration_ms: params.durationMs,
      status: "success",
    });

    return transaction;
  }

  // API Route: Credit Packs Catalogue Schema (Prepared for future purchase)
  const SERVER_CREDIT_PACKS = [
    {
      id: "pack-starter",
      sku: "pack_pages_100",
      nom: "Pack Auteur Vélin",
      pages: 100,
      prix_eur: 19,
      devise: "EUR",
      description: "Idéal pour composer 3 à 5 livres structurés avec mise en page soignée.",
      badge: "Essentiel",
      statut: "catalogue_pret",
      fonctionnalites: [
        "100 pages de crédits de génération",
        "Accès prioritaire Gemini 3.7 Flash Studio",
        "Exports PDF Haute Définition & Couvertures PNG",
        "Historique des logs et transactions complet",
      ],
    },
    {
      id: "pack-editor",
      sku: "pack_pages_500",
      nom: "Pack Studio Éditeur",
      pages: 500,
      prix_eur: 49,
      devise: "EUR",
      description: "Conçu pour les créateurs prolifiques, formateurs et maisons d'auto-édition.",
      badge: "Recommandé",
      statut: "catalogue_pret",
      fonctionnalites: [
        "500 pages de crédits de génération",
        "Vitesse de composition maximale",
        "Découpage automatique multi-chapitres enrichi",
        "Upload Cloudinary raw illimité",
        "Assistance éditoriale dédiée",
      ],
    },
    {
      id: "pack-master",
      sku: "pack_pages_1500",
      nom: "Pack Grand Œuvre",
      pages: 1500,
      prix_eur: 99,
      devise: "EUR",
      description: "Volume massif pour collections complètes, manuels techniques et séries.",
      badge: "Volume Pro",
      statut: "catalogue_pret",
      fonctionnalites: [
        "1500 pages de vélin garanties",
        "Support multi-auteurs & export batch",
        "Conservation pérenne de tous les états brouillons",
        "API webhook prête pour automatisation",
      ],
    },
  ];

  app.get("/api/studio/credit-packs", (req, res) => {
    res.json({
      success: true,
      packs: SERVER_CREDIT_PACKS,
      schema_status: "active_draft",
      currency: "EUR",
      note: "Schéma d'achat préparé pour future passerelle de paiement (ex: Stripe Checkout / Webhooks)",
    });
  });

  // API Route: Prepare purchase order schema (Draft purchase intention)
  app.post("/api/studio/purchases/prepare-order", (req, res) => {
    const { packSku, profileId = "usr-author-01" } = req.body;
    const pack = SERVER_CREDIT_PACKS.find((p) => p.sku === packSku) || SERVER_CREDIT_PACKS[0];

    const orderSchema = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      profile_id: profileId,
      pack_sku: pack.sku,
      montant_eur: pack.prix_eur,
      pages_allouees: pack.pages,
      statut: "draft_prepared",
      provider: "stripe_ready",
      created_at: new Date().toISOString(),
      metadata: {
        pack_name: pack.nom,
        devise: pack.devise,
        checkout_session_url: `/api/studio/purchases/checkout-session?sku=${pack.sku}`,
        note: "Structure d'achat initialisée (prête à être raccordée lors de l'activation du paiement)",
      },
    };

    res.json({
      success: true,
      order: orderSchema,
    });
  });

  // API Route: Credit a positive amount to the caller's own balance
  // (bonus grants, simulated Mobile Money purchases). Like generation
  // debits, this must run server-side with the service-role key — the
  // apply_credit_transaction RPC rejects direct calls from authenticated
  // clients, so the browser can never legitimately credit itself.
  app.post("/api/studio/credits/add", async (req, res) => {
    const profileId = await getAuthenticatedUserId(req);
    if (!profileId) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    const { pages, type, description } = req.body;
    const montant = Number(pages);
    if (!Number.isFinite(montant) || montant <= 0) {
      return res.status(400).json({ error: "Le paramètre pages doit être un nombre positif." });
    }
    if (type !== "bonus" && type !== "achat") {
      return res.status(400).json({ error: "Le paramètre type doit être 'bonus' ou 'achat'." });
    }

    try {
      const transaction = await supabaseAdmin.applyCreditTransaction({
        profileId,
        montant,
        type,
        description,
      });
      res.json({ success: true, transaction });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Échec du crédit de pages." });
    }
  });

  // API Route: Generation of book title, outline, and structured JSON content
  // Edge Function: generate-ebook (with pre-flight balance check BEFORE Gemini invocation)
  const handleGenerateEbook = async (req: express.Request, res: express.Response) => {
    const startTime = Date.now();
    // Declared outside the try block so the catch handler below can still
    // reach it (a `const` declared inside try is not visible in catch).
    let profileId: string | null = null;
    try {
      const {
        sourceType,
        youtubeUrl,
        videoTitle,
        fileName,
        fileContent,
        promptText,
        targetAudience,
        writingTone,
        estimatedPages = 15,
        language = "Français",
      } = req.body;

      if (!sourceType) {
        return res.status(400).json({ error: "Le paramètre sourceType est requis." });
      }

      // Identify the caller from their JWT — never trust a client-supplied
      // profileId, since anyone could pass someone else's id to debit their
      // account instead of their own.
      profileId = await getAuthenticatedUserId(req);
      if (!profileId) {
        return res.status(401).json({ error: "Authentification requise." });
      }

      // Read the real balance from the database — replaces the old
      // client-supplied `creditsAvailable` field, which was trusted as-is
      // and therefore trivially falsifiable.
      const dbCredits = await supabaseAdmin.getProfileCredits(profileId);
      if (dbCredits === null) {
        return res.status(404).json({ error: "Profil introuvable." });
      }

      const creditsAvailable = dbCredits;

      // Special handling for Mode "Mise en page" (sourceType === 'texte_utilisateur' or rawUserText)
      if (sourceType === "texte_utilisateur" || req.body.rawUserText) {
        const rawText = (req.body.rawUserText || req.body.promptText || fileContent || "").trim();
        const userTitle = (req.body.userBookTitle || req.body.title || videoTitle || "Manuscrit Auteur").trim();
        const userSubtitle = (req.body.userBookSubtitle || req.body.subtitle || "").trim();

        if (!rawText) {
          return res.status(400).json({
            error: "Le texte brut de l'auteur est requis pour le mode mise en page.",
          });
        }

        // Extract pure text for word count and detect inline images
        const cleanText = rawText.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g, "").trim();
        const imageMatches = rawText.match(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g);
        const imageCount = imageMatches ? imageMatches.length : 0;
        const totalWords = cleanText.split(/\s+/).filter(Boolean).length;

        // Dynamic pagination: text words (~350 w/p) + vertical reserved space for each image (~140 equivalent words per image)
        const customPagesRequested = Number(req.body.estimatedPages);
        const autoCalculatedPages = Math.max(1, Math.ceil((totalWords + imageCount * 140) / 350));
        const calculatedPages = (customPagesRequested && customPagesRequested > 0) ? customPagesRequested : autoCalculatedPages;
        const requiredCredits = calculatedPages;

        // Pre-flight Balance check
        if (typeof creditsAvailable === "number" && creditsAvailable < requiredCredits) {
          console.warn(
            `[CRÉDIT REFUSÉ] Solde insuffisant pour mise en page (${creditsAvailable} < ${requiredCredits}).`
          );
          return res.status(402).json({
            error: "Solde de crédits insuffisant pour cette mise en page.",
            code: "INSUFFICIENT_CREDITS",
            creditsAvailable,
            creditsRequired: requiredCredits,
            message: `Votre solde (${creditsAvailable} pages) est insuffisant pour mettre en page ce texte de ${totalWords} mots (estimé à ${requiredCredits} pages).`,
          });
        }

        const ai = getGeminiStudioClient();
        let structuredResult;

        if (!ai) {
          structuredResult = structureFallbackRawText(rawText, userTitle, userSubtitle);
        } else {
          try {
            const systemPrompt = `Tu es un architecte littéraire et typographe d'exception pour le Studio Manuscrit.
Ta mission est exclusivement de structurer un texte brut en chapitres logiques SANS JAMAIS modifier, ajouter, reformuler ou supprimer le moindre mot.`;

            const userPrompt = `Voici un texte brut. Détecte automatiquement où se trouvent les coupures naturelles de chapitres (changements de sujet, titres implicites, transitions logiques). Ne réécris JAMAIS le texte original — reproduis-le mot pour mot. Retourne uniquement un JSON avec la structure : [{titre_chapitre: '...', contenu: 'texte exact original de cette section'}]. Si le texte ne contient aucune coupure naturelle évidente, retourne-le en un seul chapitre.

--- TEXTE BRUT ORIGINAL ---
${rawText}`;

            const response = await ai.models.generateContent({
              model: "gemini-3.7-flash",
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      titre_chapitre: { type: Type.STRING, description: "Titre du chapitre déduit du sujet" },
                      contenu: { type: Type.STRING, description: "Texte original exact sans aucune altération" },
                    },
                    required: ["titre_chapitre", "contenu"],
                  },
                },
              },
            });

            const parsedChapters: Array<{ titre_chapitre: string; contenu: string }> = JSON.parse(
              response.text || "[]"
            );

            // Verbatim slicing & fidelity verification
            const exactChapters = sliceExactOriginalTextByChapters(rawText, parsedChapters);
            structuredResult = formatStructuredChaptersToEbook(
              rawText,
              userTitle,
              userSubtitle,
              exactChapters,
              totalWords,
              calculatedPages
            );
          } catch (geminiErr: any) {
            console.warn("Erreur structuration Gemini, passage au parseur de repli :", geminiErr);
            structuredResult = structureFallbackRawText(rawText, userTitle, userSubtitle);
          }
        }

        const durationMs = Date.now() - startTime;
        const transactionData = await finalizeGeneration({
          profileId,
          pages: calculatedPages,
          description: `Mise en page texte auteur : ${structuredResult.titre} (${calculatedPages} p.)`,
          ebookTitre: structuredResult.titre,
          sourceType: "texte_utilisateur",
          sourceDetail: `Texte brut auteur (${totalWords} mots)`,
          tokensUsed: Math.round(rawText.length / 3.5),
          modelUsed: ai ? "gemini-3.7-flash (structuration-verbatim)" : "moteur-local-verbatim",
          durationMs,
        });

        return res.json({
          ...structuredResult,
          credits_consommes: calculatedPages,
          credit_transaction: transactionData,
          meta: {
            tokensUsed: Math.round(rawText.length / 3.5),
            modelUsed: ai ? "gemini-3.7-flash (structuration-verbatim)" : "moteur-local-verbatim",
            durationMs,
            sourceKey: ai ? "gemini-3.7-flash" : "local",
            verbatimFidelity: "100.00% exact garanti (aucun mot altéré)",
            wordCount: totalWords,
            calculatedPages,
          },
        });
      }

      const requiredCredits = Number(estimatedPages) || 15;

      // 1. CRITICAL PRE-FLIGHT BALANCE VERIFICATION
      // Check credits balance BEFORE any Gemini API call to prevent wasted API consumption
      if (typeof creditsAvailable === "number" && creditsAvailable < requiredCredits) {
        console.warn(
          `[CRÉDIT REFUSÉ] Solde insuffisant (${creditsAvailable} < ${requiredCredits}). Appel Gemini bloqué en amont.`
        );
        return res.status(402).json({
          error: "Solde de crédits insuffisant pour cette génération.",
          code: "INSUFFICIENT_CREDITS",
          creditsAvailable,
          creditsRequired: requiredCredits,
          message: `Votre solde (${creditsAvailable} pages) est insuffisant pour composer un livre estimé à ${requiredCredits} pages. L'appel à Gemini a été préventivement bloqué pour économiser vos ressources.`,
        });
      }

      // Build context prompt
      let sourceDescription = "";
      if (sourceType === "youtube") {
        sourceDescription = `Source: Vidéo YouTube (${youtubeUrl || "URL fournie"}). Titre/Notes de la vidéo: "${videoTitle || "Non spécifié"}".`;
      } else if (sourceType === "document") {
        const previewText = fileContent ? fileContent.slice(0, 15000) : "Contenu documentaire";
        sourceDescription = `Source: Document importé (${fileName || "Fichier"}). Contenu extrait:\n${previewText}`;
      } else {
        sourceDescription = `Source: Sujet & Prompt de l'auteur: "${promptText || "Livre didactique et approfondi"}".`;
      }

      const toneGuidelines: Record<string, string> = {
        didactique: "Style pédagogique clair, riche en exemples concrets, métaphores explicatives et résumés d'action.",
        narratif: "Style littéraire immersif, structure captivante, storytelling rythmé et observations vivantes.",
        essai: "Pensée analytique rigoureuse, argumentation soignée, thèses structurées et mise en perspective philosophique ou stratégique.",
        guide_pratique: "Orientation résultats, étapes actionnables pas-à-pas, fiches méthodologiques et conseils applicables immédiatement.",
        academique: "Rigueur conceptuelle, définitions étymologiques, références méthodiques et approfondissement théorique.",
        inspirationnel: "Ton visionnaire, dynamique et stimulant, formules mémorables et élévation d'esprit.",
      };

      const targetPages = Math.max(1, Number(estimatedPages) || 15);
      const suggestedChaptersCount = Math.min(24, Math.max(2, Math.round((targetPages * 350) / 2500)));
      const minSectionsPerChapter = 4;
      const minParagraphsPerSection = 4;

      const systemPrompt = `Tu es un maître écrivain, éditeur en chef et architecte littéraire d'exception pour Sileyabook Studio.
Ta mission est de concevoir un livre complet, structuré, profond et richement développé à partir de la source fournie.
L'utilisateur a expressément choisi un volume cible personnalisé de ${targetPages} pages manuscrites (densité de 350 mots par page, soit environ ${targetPages * 350} mots au total).
Le livre doit comporter exactement ${suggestedChaptersCount} chapitres denses et substantiels adaptés précisément à ce volume de ${targetPages} pages choisi par l'auteur.

CONSIGNES STRICTES SUR LA LONGUEUR ET LA STRUCTURE DES CHAPITRES :
- RÈGLE ÉDITORIALE ABSOLUE : NE génère PAS de résumé de chapitre, NI de citations isolées ou callouts. Le texte de chaque chapitre doit débuter immédiatement et se déployer de manière fluide, immersive et continue.
- Chaque chapitre généré doit contenir environ 2500 mots (entre 2 350 et 2 650 mots, ni significativement moins, ni plus).
- La densité typographique du format A5 est calibrée à 350 mots par page (soit environ 7 à 7,5 pages A5 par chapitre unitaire).
- Si le contenu naturel d'un chapitre dépasse cette norme, découpe-le en sous-chapitres focalisés (ex: Chapitre X - Partie 1 et Chapitre X - Partie 2) plutôt que de créer des déséquilibres.
- Structure chaque chapitre autour d'une idée principale claire, avec des exemples concrets, des études de cas réelles et des étapes actionnables pas-à-pas plutôt que du texte délayé ou du remplissage pour atteindre le nombre de mots.
Chaque chapitre doit comporter au minimum ${minSectionsPerChapter} sous-sections avec de vrais paragraphes complets (au moins ${minParagraphsPerSection} à 6 paragraphes riches en substance par section, sans texte de remplissage banal ni ellipses).

${ANTI_FABRICATION_RULES}

Langue de rédaction: ${language}
Public cible: ${targetAudience || "Passionnés et professionnels cherchant une maîtrise approfondie"}
Tonalité stylistique: ${toneGuidelines[writingTone] || toneGuidelines.didactique}
Volume visé choisi par l'utilisateur: ${targetPages} pages manuscrites (${suggestedChaptersCount} chapitres de ~2500 mots chacun, total ~${targetPages * 350} mots).`;

      const userPrompt = `Rédige le livre complet à partir des éléments suivants :
${sourceDescription}

Respecte scrupuleusement les contraintes de calibrage :
- Pas de résumés ni de citations / callouts : rédaction directe, dense et continue.
- Chaque chapitre doit comporter environ 2 500 mots réels (calibrage exact 350 mots/page).
- Découpe en chapitres focalisés pour maintenir la clarté et l'impact.
- Approche didactique, rigoureuse et concrète : ancre chaque chapitre dans la matière ci-dessus, pas de remplissage.
- Chaque chapitre doit exploiter des éléments SPÉCIFIQUES à son propre sujet tirés de cette source ; n'invente jamais d'entreprise, de statistique ou d'étude de cas qui n'en provient pas (voir règles anti-fabrication ci-dessus).

Génère une réponse strictement structurée en JSON selon le schéma demandé avec :
1. Un titre fort, élégant et mémorable
2. Un sous-titre captivant
3. Une description éditoriale synthétique (pour la 4ème de couverture)
4. Un plan structuré des chapitres
5. Le contenu textuel intégral comprenant :
   - Une introduction générale immersive
   - Tous les chapitres avec leurs sections et paragraphes rédigés de façon dense et continue
   - Une conclusion prospective et inspirante
   - 3 à 5 termes clés pour le glossaire`;

      const ai = getGeminiStudioClient();

      if (!ai) {
        // High quality deterministic generative engine fallback when no API key is provided
        const simulatedBook = generateFallbackManuscrit({
          sourceType,
          youtubeUrl,
          videoTitle,
          fileName,
          promptText,
          targetAudience,
          writingTone,
          estimatedPages: requiredCredits,
          language,
        });

        const actualPages = simulatedBook.contenu?.metadata?.pages_estimees || requiredCredits;
        const durationMs = Date.now() - startTime;

        const transactionData = await finalizeGeneration({
          profileId,
          pages: actualPages,
          description: `Génération manuscrit : ${simulatedBook.titre}`,
          ebookTitre: simulatedBook.titre,
          sourceType,
          sourceDetail: youtubeUrl || fileName || (promptText ? promptText.slice(0, 80) : "Source personnalisée"),
          tokensUsed: 4250,
          modelUsed: "gemini-3.7-flash (simulation)",
          durationMs,
        });

        return res.json({
          ...simulatedBook,
          credits_consommes: actualPages,
          credit_transaction: transactionData,
          meta: {
            tokensUsed: 4250,
            modelUsed: "gemini-3.7-flash (simulation)",
            durationMs,
            sourceKey: "simulation",
          },
        });
      }

      // Call Gemini with structured schema. maxOutputTokens now scales with
      // the requested chapter count instead of a flat 16384 — a full
      // ${suggestedChaptersCount}-chapter book at ~2500 words/chapter can
      // need far more than 16384 tokens, and a truncated response used to
      // silently produce short/malformed chapters that then got replaced
      // wholesale by the static template below (the root cause of a book
      // where every chapter looked templated).
      const dynamicMaxOutputTokens = Math.min(65536, Math.max(16384, suggestedChaptersCount * 5500 + 3000));

      let response: any = null;
      let usedModel = "gemini-3.7-flash";
      const modelsToTry = GEMINI_MODELS_TO_TRY;

      // Two full passes over the model list: Gemini's own 503 errors state
      // demand spikes are "usually temporary", but the code previously
      // never retried at all before giving up entirely to the fully
      // templated emergency fallback. A short backoff between passes gives
      // a transient overload a chance to clear.
      for (let attempt = 0; attempt < 2 && !response; attempt++) {
        if (attempt > 0) {
          console.warn("Premier passage Gemini entièrement échoué, nouvelle tentative après backoff...");
          await new Promise((r) => setTimeout(r, 4000));
        }
        for (const modelName of modelsToTry) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                maxOutputTokens: dynamicMaxOutputTokens,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titre: { type: Type.STRING, description: "Titre principal du livre" },
              sous_titre: { type: Type.STRING, description: "Sous-titre éditorial" },
              description: { type: Type.STRING, description: "Présentation 4ème de couverture" },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    numero: { type: Type.INTEGER },
                    titre: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["numero", "titre", "description"],
                },
              },
              contenu: {
                type: Type.OBJECT,
                properties: {
                  preface: { type: Type.STRING },
                  introduction: { type: Type.STRING },
                  chapitres: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        numero: { type: Type.INTEGER },
                        titre: { type: Type.STRING },
                        resume: { type: Type.STRING },
                        objectifs: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        points_cles: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        sections: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              titre: { type: Type.STRING },
                              sous_titre: { type: Type.STRING },
                              paragraphes: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              notes_de_bas_de_page: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    id: { type: Type.STRING },
                                    reference_number: { type: Type.INTEGER },
                                    label: { type: Type.STRING },
                                    contenu: { type: Type.STRING },
                                    terme_cible: { type: Type.STRING },
                                  },
                                  required: ["id", "reference_number", "contenu"],
                                },
                              },
                              callout: {
                                type: Type.OBJECT,
                                properties: {
                                  type: { type: Type.STRING },
                                  content: { type: Type.STRING },
                                  author: { type: Type.STRING },
                                },
                              },
                            },
                            required: ["titre", "paragraphes"],
                          },
                        },
                        conclusion_chapitre: { type: Type.STRING },
                      },
                      required: ["id", "numero", "titre", "resume", "sections"],
                    },
                  },
                  conclusion: { type: Type.STRING },
                  epilogue: { type: Type.STRING },
                  glossaire: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        terme: { type: Type.STRING },
                        definition: { type: Type.STRING },
                      },
                      required: ["terme", "definition"],
                    },
                  },
                  metadata: {
                    type: Type.OBJECT,
                    properties: {
                      pages_estimees: { type: Type.NUMBER },
                      mots_total: { type: Type.NUMBER },
                      temps_lecture_min: { type: Type.NUMBER },
                      genre: { type: Type.STRING },
                      style: { type: Type.STRING },
                      langue: { type: Type.STRING },
                      tonalite: { type: Type.STRING },
                    },
                    required: ["pages_estimees", "mots_total", "temps_lecture_min", "genre", "style", "langue", "tonalite"],
                  },
                },
                required: ["introduction", "chapitres", "conclusion", "metadata"],
              },
            },
            required: ["titre", "sous_titre", "description", "plan", "contenu"],
          },
        },
      });
            usedModel = modelName;
            break;
          } catch (callErr: any) {
            console.warn(`Tentative avec ${modelName} (${callErr.status || callErr.message}), passage au modèle suivant...`);
          }
        }
      }

      if (!response) {
        throw new Error("Tous les modèles Gemini ont échoué ou sont temporairement indisponibles après deux passages complets.");
      }

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);
      const durationMs = Date.now() - startTime;
      const actualPages = requiredCredits;

      // Enforcement of chapter calibration & automatic splitting if exceeding 5 pages in A5
      if (parsedData.contenu && Array.isArray(parsedData.contenu.chapitres)) {
        let rawChapters = parsedData.contenu.chapitres;

        // If fewer chapters than requested, supplement with a real Gemini
        // regeneration attempt grounded in that chapter's own plan entry
        // first; only fall back to the static template if Gemini fails
        // twice in a row (previously this went straight to the template,
        // which is why padded chapters always looked identical).
        if (rawChapters.length < suggestedChaptersCount) {
          const missingCount = suggestedChaptersCount - rawChapters.length;
          const currentPlan = Array.isArray(parsedData.plan) ? parsedData.plan : [];
          for (let m = 0; m < missingCount; m++) {
            const nextNum = rawChapters.length + 1;
            const planItem = currentPlan.find((p: any) => p.numero === nextNum);
            const topicTitle = planItem?.titre || `Approfondissement et Pratique — Module ${nextNum}`;
            const geminiChapter = await generateChapterContentWithGemini(ai, {
              subject: topicTitle,
              contextDescription: planItem?.description ? `${planItem.description}\n\n${sourceDescription}` : sourceDescription,
              targetAudience,
              writingTone,
              language,
              chapterNumber: nextNum,
            });
            const newChap = geminiChapter
              ? {
                  id: `chap-${nextNum}`,
                  numero: nextNum,
                  titre: geminiChapter.titre || topicTitle,
                  resume: geminiChapter.resume || "",
                  objectifs: geminiChapter.objectifs || [],
                  points_cles: geminiChapter.points_cles || [],
                  sections: geminiChapter.sections || [],
                  conclusion_chapitre: geminiChapter.conclusion_chapitre || "",
                }
              : generateCalibratedSubstantiveChapter(topicTitle, nextNum);
            rawChapters.push(newChap);
          }
        }

        // Ensure every chapter has substantial depth (at least 1,400 words).
        // A short chapter now gets one real regeneration attempt (grounded
        // in its own plan title/description, not just re-asked generically)
        // before falling back to the static template — the template is now
        // a last resort instead of the automatic outcome for every short
        // chapter, which is what previously made every chapter in a book
        // look identical whenever Gemini truncated or under-wrote a few of them.
        const depthCheckedChapters: any[] = [];
        for (let idx = 0; idx < rawChapters.length; idx++) {
          const chap = rawChapters[idx];
          const currentWords = countChapterWords(chap);
          if (currentWords < 1400) {
            const currentPlan = Array.isArray(parsedData.plan) ? parsedData.plan : [];
            const planItem = currentPlan.find((p: any) => p.numero === idx + 1);
            const topicTitle = chap.titre || planItem?.titre || `Chapitre ${idx + 1}`;
            const geminiChapter = await generateChapterContentWithGemini(ai, {
              subject: topicTitle,
              contextDescription: planItem?.description ? `${planItem.description}\n\n${sourceDescription}` : sourceDescription,
              targetAudience,
              writingTone,
              language,
              chapterNumber: idx + 1,
            });
            if (geminiChapter && countChapterWords(geminiChapter) >= 1400) {
              depthCheckedChapters.push({
                id: chap.id || `chap-${idx + 1}`,
                numero: idx + 1,
                titre: geminiChapter.titre || topicTitle,
                resume: geminiChapter.resume || chap.resume || "",
                objectifs: geminiChapter.objectifs?.length ? geminiChapter.objectifs : chap.objectifs || [],
                points_cles: geminiChapter.points_cles?.length ? geminiChapter.points_cles : chap.points_cles || [],
                sections: geminiChapter.sections || [],
                conclusion_chapitre: geminiChapter.conclusion_chapitre || "",
              });
            } else {
              const calibrated = generateCalibratedSubstantiveChapter(topicTitle, idx + 1);
              depthCheckedChapters.push({
                ...calibrated,
                id: chap.id || `chap-${idx + 1}`,
                numero: idx + 1,
                titre: chap.titre || calibrated.titre,
                resume: chap.resume || calibrated.resume,
                objectifs: chap.objectifs?.length ? chap.objectifs : calibrated.objectifs,
                points_cles: chap.points_cles?.length ? chap.points_cles : calibrated.points_cles,
              });
            }
          } else {
            depthCheckedChapters.push(chap);
          }
        }
        rawChapters = depthCheckedChapters;

        const processedChapters: any[] = [];
        for (const chap of rawChapters) {
          const splitResults = splitChapterIfExceedsLimit(chap);
          processedChapters.push(...splitResults);
        }

        // Renumber sequentially and enrich with metrics
        processedChapters.forEach((ch, idx) => {
          ch.numero = idx + 1;
          ch.id = `chap-${idx + 1}`;
          ch.metrics = getChapterMetrics(ch);
        });

        parsedData.contenu.chapitres = processedChapters;

        // Synchronize table of contents / plan
        parsedData.plan = processedChapters.map((ch) => ({
          numero: ch.numero,
          titre: ch.titre,
          description: ch.resume || `Chapitre ${ch.numero}`,
        }));

        // Accurate total word count and pages calculation
        let calculatedTotalWords = 0;
        processedChapters.forEach((ch) => {
          calculatedTotalWords += countChapterWords(ch);
        });
        if (parsedData.contenu.introduction) {
          calculatedTotalWords += parsedData.contenu.introduction.split(/\s+/).filter(Boolean).length;
        }
        if (parsedData.contenu.conclusion) {
          calculatedTotalWords += parsedData.contenu.conclusion.split(/\s+/).filter(Boolean).length;
        }

        if (!parsedData.contenu.metadata) {
          parsedData.contenu.metadata = {};
        }
        parsedData.contenu.metadata.mots_total = calculatedTotalWords;
        parsedData.contenu.metadata.pages_estimees = Math.max(targetPages, Math.ceil(calculatedTotalWords / 350));
        parsedData.contenu.metadata.temps_lecture_min = Math.max(1, Math.round(calculatedTotalWords / 200));

        // Post-generation verification: compare every chapter's real body
        // text against every other chapter's before returning the book.
        // This is what would have caught "L'Ère Numérique Africaine" —
        // a book where most/all chapters ended up built from the same
        // static template — before it ever reached the user. If at least
        // half of all chapter pairs are near-duplicates, the generation is
        // rejected outright and NOT billed, rather than silently delivered.
        const duplicationReport = analyzeChapterDuplication(processedChapters);
        if (duplicationReport.severelyDuplicated) {
          console.error(
            `[DUPLICATION SÉVÈRE] ${duplicationReport.flaggedPairs.length} paire(s) de chapitres quasi-identiques (similarité max ${duplicationReport.maxSimilarity}). Génération rejetée, aucun crédit débité.`,
            duplicationReport.flaggedPairs
          );
          return res.status(503).json({
            error: "La génération a produit un contenu trop répétitif entre les chapitres (probable échec partiel du modèle) et a été rejetée avant toute facturation. Merci de relancer la génération.",
            code: "CONTENT_DUPLICATION_REJECTED",
            duplicationReport,
          });
        }
        if (duplicationReport.flaggedPairs.length > 0) {
          console.warn(`[DUPLICATION] ${duplicationReport.flaggedPairs.length} paire(s) de chapitres partiellement similaires détectée(s).`, duplicationReport.flaggedPairs);
        }
        parsedData.contenu.duplicationReport = duplicationReport;
      }

      // Estimate tokens
      const estimatedTokens = Math.round((responseText.length + userPrompt.length) / 3.8);

      const transactionData = await finalizeGeneration({
        profileId,
        pages: actualPages,
        description: `Génération manuscrit : ${parsedData.titre || "Livre"}`,
        ebookTitre: parsedData.titre || "Livre",
        sourceType,
        sourceDetail: youtubeUrl || fileName || (promptText ? promptText.slice(0, 80) : "Source personnalisée"),
        tokensUsed: estimatedTokens,
        modelUsed: usedModel,
        durationMs,
      });

      return res.json({
        ...parsedData,
        credits_consommes: actualPages,
        credit_transaction: transactionData,
        meta: {
          tokensUsed: estimatedTokens,
          modelUsed: usedModel,
          maxOutputTokens: dynamicMaxOutputTokens,
          durationMs,
          sourceKey: process.env.GEMINI_API_KEY_STUDIO ? "GEMINI_API_KEY_STUDIO" : "GEMINI_API_KEY",
        },
      });
    } catch (err: any) {
      console.error("Erreur lors de la génération Gemini Studio:", err);

      if (!profileId) {
        // Auth was never established (e.g. the failure happened before or
        // during the JWT check) — nothing to bill or log against.
        return res.status(401).json({ error: "Authentification requise." });
      }

      // Previously this branch silently built a full "resilience mode"
      // manuscript entirely out of generateFallbackManuscrit (100% static
      // template, every chapter drawn from the same 5 hardcoded THEMES)
      // and billed the user's real credits for it — this is exactly how a
      // book like "L'Ère Numérique Africaine" could come out with every
      // chapter sharing identical structure and a fabricated case study
      // (only the company name varied). A templated book is not a
      // legitimate deliverable, so it is no longer billed or returned as
      // a success: the user gets a clear error and their credits are
      // untouched, so they can retry once Gemini recovers.
      const durationMs = Date.now() - startTime;
      console.error(
        `Génération Gemini indisponible après tentatives (${err.message || err}) — rejet sans facturation plutôt que livraison d'un manuscrit de repli.`
      );
      return res.status(503).json({
        error: "Le service de génération est temporairement indisponible. Aucun crédit n'a été débité — merci de réessayer dans quelques instants.",
        code: "GENERATION_UNAVAILABLE",
        durationMs,
      });
    }
  };

  // Register Edge Function route and alias
  app.post("/api/studio/generate-ebook", handleGenerateEbook);
  app.post("/api/studio/generate", handleGenerateEbook);

  // Dedicated Route: Generate individual calibrated chapter with strict ~2000 words & ≤5 pages A5 constraints
  app.post("/api/studio/generate-chapter", async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        subject,
        bookContext = "Guide Pratique Professionnel",
        chapterNumber = 1,
        targetAudience = "Praticiens et passionnés recherchant une maîtrise concrète",
        writingTone = "guide_pratique",
        language = "Français",
      } = req.body;

      if (!subject || typeof subject !== "string" || !subject.trim()) {
        return res.status(400).json({ error: "Le paramètre subject (sujet du chapitre) est requis." });
      }

      // Delegates to the shared helper (see generateChapterContentWithGemini
      // above): same anti-fabrication rules as the main book generator, and
      // a realistic 60s-per-model timeout instead of the previous 12s one
      // — a 12s timeout was shorter than real Gemini latency for a
      // structured ~2500-word chapter (25-70s+ observed), so this endpoint
      // was silently falling through to the static template on every call.
      const ai = getGeminiStudioClient();
      let parsedChapter: any = await generateChapterContentWithGemini(ai, {
        subject,
        contextDescription: `Contexte du livre : ${bookContext}`,
        targetAudience,
        writingTone,
        language,
        chapterNumber: Number(chapterNumber) || 1,
      });
      let usedModel = parsedChapter ? "gemini (voir logs serveur)" : "gemini-3.7-flash";

      if (!parsedChapter) {
        // High quality calibrated substantive chapter (~2500 words / 350 words per page A5)
        parsedChapter = generateCalibratedSubstantiveChapter(subject, Number(chapterNumber) || 1);
        usedModel = "moteur-editorial-calibre-2500-mots";
      }

      // Structure base Chapter object
      const baseChapter = {
        id: `chap-${chapterNumber}`,
        numero: Number(chapterNumber) || 1,
        titre: parsedChapter.titre,
        resume: parsedChapter.resume,
        objectifs: parsedChapter.objectifs || [],
        points_cles: parsedChapter.points_cles || [],
        sections: parsedChapter.sections || [],
        conclusion_chapitre: parsedChapter.conclusion_chapitre,
      };

      // Split if exceeds 5 pages in A5 format
      const splitChapters = splitChapterIfExceedsLimit(baseChapter);
      const durationMs = Date.now() - startTime;
      const initialMetrics = getChapterMetrics(baseChapter);

      return res.json({
        success: true,
        chapter: splitChapters[0],
        chapters: splitChapters,
        wasSplit: splitChapters.length > 1,
        metrics: {
          wordCount: initialMetrics.wordCount,
          characterCount: initialMetrics.characterCount,
          estimatedPagesA5: initialMetrics.estimatedPagesA5,
          estimatedPagesKdp6x9: initialMetrics.estimatedPagesKdp6x9,
          isWithinWordTarget: initialMetrics.isWithinWordTarget,
          isUnder5PagesA5: initialMetrics.isUnder5PagesA5,
          maxOutputTokensConfigured: 16384,
          modelUsed: usedModel,
          durationMs,
        },
      });
    } catch (err: any) {
      console.error("Erreur dans /api/studio/generate-chapter:", err);
      return res.status(500).json({
        error: "Erreur lors de la génération du chapitre",
        details: err.message || String(err),
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Studio Manuscrit server running on http://localhost:${PORT}`);
  });
}

function buildChapterPlanTitles(topic: string, count: number): Array<{ numero: number; titre: string; description: string }> {
  const defaultThemes = [
    { titre: `Genèse, Fondements et Déconstruction des Mythes`, description: `Comprendre le contexte initial, définir les postulats premiers et déconstruire les fausses intuitions autour de « ${topic} ».` },
    { titre: `Cartographie des Enjeux et Diagnostic Préliminaire`, description: "Auditer les flux critiques, identifier les goulots d'étranglement et mesurer la maturité de départ." },
    { titre: `L'Architecture des Premiers Principes et Leviers Fondamentaux`, description: "Définir les invariants, modulariser les composants et simplifier la chaîne de valeur." },
    { titre: `Protocoles Opérationnels et Mécaniques d'Exécution Pas-à-Pas`, description: "Méthodologie séquentielle en 4 étapes pour une application directe et sans friction." },
    { titre: `Études de Cas Comparées et Retours d'Expérience Chiffrés`, description: "Analyses de terrain : de la paralysie bureaucratique à l'efficience opérationnelle." },
    { titre: `Systèmes de Mesure, Hygiène Métrique et Indicateurs Clés`, description: "Restreindre le pilotage aux métriques maîtresses pour préserver la clarté décisionnelle." },
    { titre: `Gestion des Risques, Résilience et Prévention des Écueils`, description: "Anticiper les ruptures, désamorcer les pièges classiques et gérer les imprévus avec sérénité." },
    { titre: `Automatisation Raisonnée, Passage à l'Échelle et Rituels d'Équipe`, description: "Déployer les protocoles à grande échelle tout en maintenant l'exigence et l'alignement." },
    { titre: `Transmission, Pérennisation et Vision Prospective Durable`, description: "Inscrire les acquis dans une culture partagée et bâtir des fondations solides pour l'avenir." },
    { titre: `Maîtrise Avancée, Écosystèmes Partenaires et Excellence Continue`, description: "Approfondissement supérieur, synergies externes et perfectionnement perpétuel." },
    { titre: `Stratégies d'Impact Maximal et Déploiement Global`, description: "Amplification des résultats, élimination des redondances et pérennité institutionnelle." },
    { titre: `Synthèse Magistrale et Feuilles de Route Personnalisées`, description: "Consolidation des enseignements, grilles d'audit autonome et passage immédiat à l'action." },
  ];

  const plan: Array<{ numero: number; titre: string; description: string }> = [];
  for (let i = 0; i < count; i++) {
    const theme = defaultThemes[i] || {
      titre: `Approfondissement Opérationnel — Module ${i + 1} : ${topic}`,
      description: `Développement thématique approfondi et applications pratiques avancées pour la phase ${i + 1}.`,
    };
    plan.push({
      numero: i + 1,
      titre: theme.titre,
      description: theme.description,
    });
  }
  return plan;
}

function generateFallbackManuscrit(data: any) {
  let mainTitle = "L'Art de la Transmission";
  let subtitle = "Guide fondamental pour structurer la pensée et captiver son audience";
  let topic = "Création et Maîtrise";

  if (data.sourceType === "youtube") {
    topic = data.videoTitle || "Synthèse Audiovisuelle";
    mainTitle = `Les Clés de ${topic.slice(0, 35)}`;
    subtitle = "De la conférence au manuscrit structuré : synthèse approfondie des enseignements";
  } else if (data.sourceType === "document") {
    topic = data.fileName ? data.fileName.replace(/\.[^/.]+$/, "") : "Document d'Analyse";
    mainTitle = `Le Traité de ${topic.slice(0, 30)}`;
    subtitle = "Recherche documentée, formalisation méthodique et analyse d'impact";
  } else if (data.promptText) {
    const words = data.promptText.trim().split(" ");
    topic = words.slice(0, 5).join(" ");
    mainTitle = `${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
    subtitle = "Principes directeurs, mise en pratique et perspectives fondamentales";
  }

  const targetPages = Math.max(1, Number(data.estimatedPages) || 15);
  const targetChaptersCount = Math.min(24, Math.max(2, Math.round((targetPages * 350) / 2500)));

  const plan = buildChapterPlanTitles(topic, targetChaptersCount);
  const chapitres: any[] = [];

  for (let i = 0; i < plan.length; i++) {
    const chapData = generateCalibratedSubstantiveChapter(plan[i].titre, i + 1);
    chapData.metrics = getChapterMetrics(chapData);
    chapitres.push(chapData);
  }

  const introText = `La prolifération des flux d'information rend plus précieuse que jamais la capacité à ordonner, synthétiser et approfondir. Aborder le thème de « ${topic} » ne relève pas d'une simple curiosité passagère, mais d'une exigence de discernement. À travers les ${targetPages} pages de ce manuscrit, nous explorerons méthodiquement les rouages invisibles qui transforment l'intention en accomplissement.\n\nCe livre s'adresse à ceux qui refusent les solutions superficielles et recherchent des structures de pensée solides. En articulant théorie rigoureuse, études de cas chiffrées et protocoles opérationnels en 4 étapes, chaque chapitre constitue une pierre angulaire vers une maîtrise autonome.\n\nPrenez le temps d'assimiler chaque principe avant de passer à l'application pratique : la régularité et la constance dans l'exécution de ces fondamentaux constituent le véritable secret des réussites durables.`;

  const conclusionText = `Arrivé au terme de cet itinéraire de ${targetPages} pages à travers « ${topic} », nous mesurons le chemin parcouru. Ce livre n'a pas vocation à clore le débat, mais à fournir le compas nécessaire pour explorer de nouveaux territoires intellectuels et opérationnels avec confiance, lucidité et méthode.\n\nLa véritable valeur des principes exposés réside dans leur application quotidienne. Les concepts ne prennent vie que lorsqu'ils sont confrontés aux frictions du réel et enrichis par vos propres expérimentations.\n\nPuisse cet ouvrage vous accompagner comme un allié fidèle et une référence durable dans l'accomplissement de tous vos projets d'excellence.`;

  // Accurate word count
  let totalWords = 0;
  chapitres.forEach((ch) => {
    totalWords += countChapterWords(ch);
  });
  totalWords += introText.split(/\s+/).filter(Boolean).length;
  totalWords += conclusionText.split(/\s+/).filter(Boolean).length;

  const calculatedPages = Math.max(1, Math.ceil(totalWords / 350));

  return {
    titre: mainTitle,
    sous_titre: subtitle,
    description: `Une œuvre didactique et immersive de ${targetPages} pages structurée pour explorer les fondements, les dynamiques opérationnelles et les applications concrètes de « ${topic} ». Rédigé pour offrir une clarté intellectuelle absolue et des repères durables.`,
    plan,
    contenu: {
      preface: `Tout grand projet commence par une étincelle de curiosité. Ce manuscrit de ${targetPages} pages est conçu comme une passerelle entre la réflexion brute et la matérialisation lucide des idées.`,
      introduction: introText,
      chapitres,
      conclusion: conclusionText,
      epilogue: "Puisse ce manuscrit vous accompagner longtemps comme un allié fidèle dans toutes vos quêtes d'expression et d'excellence.",
      glossaire: [
        { terme: "Premier Principe", definition: "Proposition fondamentale irréductible servant de point d'ancrage logique à toute construction théorique." },
        { terme: "Boucle de Rétroaction", definition: "Mécanisme par lequel le résultat d'une action informe et réoriente immédiatement les décisions suivantes." },
        { terme: "Effet Cumulé", definition: "Amplification géométrique des résultats issue de la régularité d'actions modestes répétées dans le temps." },
        { terme: "Modularité Stratégique", definition: "Principe d'architecture isolant chaque fonction pour empêcher les défaillances en chaîne." },
        { terme: "Hygiène Métrique", definition: "Discipline consistant à ne conserver que les indicateurs déclenchant une action corrective directe." },
      ],
      metadata: {
        pages_estimees: Math.max(targetPages, calculatedPages),
        mots_total: totalWords,
        temps_lecture_min: Math.max(1, Math.round(totalWords / 200)),
        genre: "Essai & Traité Pratique",
        style: data.writingTone || "Didactique",
        langue: data.language || "Français",
        tonalite: "Éclairée, structurée et inspirante",
      },
    },
  };
}

function sliceExactOriginalTextByChapters(
  rawOriginalText: string,
  chapterCues: Array<{ titre_chapitre: string; contenu: string }>
): Array<{ titre_chapitre: string; contenu: string; exactOriginal: boolean }> {
  if (!chapterCues || chapterCues.length === 0) {
    return [
      {
        titre_chapitre: "Texte Intégral",
        contenu: rawOriginalText.trim(),
        exactOriginal: true,
      },
    ];
  }

  // Find where each chapter starts in the raw original text
  const positions: Array<{ idx: number; title: string; hint: string }> = [];

  for (let i = 0; i < chapterCues.length; i++) {
    const cue = chapterCues[i];
    const hintContent = (cue.contenu || "").trim();
    const words = hintContent.split(/\s+/);
    
    // Try matching first 6-8 words
    let matchPos = -1;
    for (let wordCount = Math.min(8, words.length); wordCount >= 3; wordCount--) {
      const searchPhrase = words.slice(0, wordCount).join(" ");
      if (searchPhrase.length > 6) {
        matchPos = rawOriginalText.indexOf(searchPhrase);
        if (matchPos !== -1) break;
      }
    }

    // If still not found, try searching for the first 25 characters
    if (matchPos === -1 && hintContent.length >= 10) {
      matchPos = rawOriginalText.indexOf(hintContent.slice(0, 25));
    }

    positions.push({
      idx: matchPos,
      title: cue.titre_chapitre || `Chapitre ${i + 1}`,
      hint: hintContent,
    });
  }

  // First chapter anchor
  if (positions[0].idx < 0 || positions[0].idx > 120) {
    positions[0].idx = 0;
  }

  // Ensure monotonically non-decreasing offsets
  let runningOffset = 0;
  for (let i = 0; i < positions.length; i++) {
    if (positions[i].idx < runningOffset) {
      positions[i].idx = runningOffset;
    } else {
      runningOffset = positions[i].idx;
    }
  }

  // Slice exact original text verbatim between [positions[i].idx, positions[i+1].idx]
  const exactResult: Array<{ titre_chapitre: string; contenu: string; exactOriginal: boolean }> = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx;
    const end =
      i < positions.length - 1 && positions[i + 1].idx > start
        ? positions[i + 1].idx
        : rawOriginalText.length;

    const exactChunk = rawOriginalText.substring(start, end).trim();
    exactResult.push({
      titre_chapitre: positions[i].title,
      contenu: exactChunk.length > 0 ? exactChunk : (positions[i].hint || "").trim(),
      exactOriginal: true,
    });
  }

  return exactResult;
}

function formatStructuredChaptersToEbook(
  rawOriginalText: string,
  userTitle: string,
  userSubtitle: string | undefined,
  chapters: Array<{ titre_chapitre: string; contenu: string; exactOriginal?: boolean }>,
  totalWords: number,
  calculatedPages: number
) {
  const cleanTitle = userTitle.trim() || "Manuscrit sans titre";
  const cleanSubtitle = userSubtitle?.trim() || "Texte original de l'auteur mis en page";
  
  // Format each chapter into Chapter structure
  const formattedChapters = chapters.map((chap, idx) => {
    const rawChapterText = chap.contenu || "";
    // Break into paragraphs by double newlines or single newlines
    const rawParas = rawChapterText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const paragraphs = rawParas.length > 0 ? rawParas : [rawChapterText];
    
    // Group paragraphs into sections (2-3 paragraphs per section)
    const sections: Array<{
      titre: string;
      paragraphes: string[];
    }> = [];

    if (paragraphs.length <= 3) {
      sections.push({
        titre: chap.titre_chapitre,
        paragraphes: paragraphs,
      });
    } else {
      // Split into 2 or 3 sections
      const chunkSize = Math.ceil(paragraphs.length / 2);
      for (let sIdx = 0; sIdx < paragraphs.length; sIdx += chunkSize) {
        const sliceParas = paragraphs.slice(sIdx, sIdx + chunkSize);
        sections.push({
          titre: sIdx === 0 ? chap.titre_chapitre : `Suite — ${chap.titre_chapitre}`,
          paragraphes: sliceParas,
        });
      }
    }

    const firstSnippet = paragraphs[0]?.slice(0, 140) || "";
    
    return {
      id: `chap-${idx + 1}`,
      numero: idx + 1,
      titre: chap.titre_chapitre,
      resume: `Section originale de l'auteur consacrée à : ${chap.titre_chapitre}.`,
      objectifs: [
        `Lecture intégrale du texte de l'auteur : ${chap.titre_chapitre}`,
        "Assimilation des arguments et des transitions logiques du manuscrit",
      ],
      points_cles: [
        `Thématique maîtresse : ${chap.titre_chapitre}`,
        firstSnippet ? `Extrait : « ${firstSnippet}... »` : "Texte brut auteur sans modification",
      ],
      sections,
      conclusion_chapitre: `Fin de la section : ${chap.titre_chapitre}.`,
    };
  });

  const plan = formattedChapters.map((ch) => ({
    numero: ch.numero,
    titre: ch.titre,
    description: ch.resume,
  }));

  const readingTimeMin = Math.max(1, Math.round(totalWords / 200));
  const firstPara = formattedChapters[0]?.sections[0]?.paragraphes[0] || rawOriginalText.slice(0, 300);
  const lastChap = formattedChapters[formattedChapters.length - 1];
  const lastParas = lastChap?.sections[lastChap.sections.length - 1]?.paragraphes;
  const lastPara = (lastParas && lastParas.length > 0) ? lastParas[lastParas.length - 1] : "";

  return {
    titre: cleanTitle,
    sous_titre: cleanSubtitle,
    description: `Manuscrit composé à partir des écrits bruts de l'auteur (${totalWords} mots répartis en ${chapters.length} chapitres naturels). Fidélité textuelle 100% absolue et mise en page éditoriale.`,
    plan,
    source_type: "texte_utilisateur" as const,
    source_detail: `Texte brut auteur (${totalWords} mots, ${calculatedPages} p.)`,
    contenu: {
      introduction: firstPara,
      chapitres: formattedChapters,
      conclusion: lastPara || "Fin du manuscrit original.",
      metadata: {
        pages_estimees: calculatedPages,
        mots_total: totalWords,
        temps_lecture_min: readingTimeMin,
        genre: "Texte Auteur (Mise en page)",
        style: "Verbatim Auteur",
        langue: "Français",
        tonalite: "Authentique",
      },
    },
  };
}

function structureFallbackRawText(rawText: string, title: string, subtitle?: string) {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const totalWords = rawText.trim().split(/\s+/).filter(Boolean).length;
  const calculatedPages = Math.max(1, Math.ceil(totalWords / 350));

  const chapters: Array<{ titre_chapitre: string; contenu: string; exactOriginal: boolean }> = [];
  let currentTitle = "Introduction & Prolégomènes";
  let currentParas: string[] = [];
  let currentWords = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const isHeadingLike =
      /^(chapitre|partie|section|module|\b[IVXLCDM]+\b|[0-9]+\.)/i.test(p) ||
      (p.length < 70 && (p.toUpperCase() === p || p.endsWith(":")));

    if (isHeadingLike && currentParas.length > 0) {
      chapters.push({
        titre_chapitre: currentTitle,
        contenu: currentParas.join("\n\n"),
        exactOriginal: true,
      });
      currentTitle = p.replace(/^[#*\-_\s]+/, "").trim();
      currentParas = [];
      currentWords = 0;
    } else {
      currentParas.push(p);
      currentWords += p.split(/\s+/).length;

      // Group natural breaks every ~350-450 words if no explicit headers found
      if (currentWords >= 350 && i < paragraphs.length - 1 && chapters.length < 6) {
        chapters.push({
          titre_chapitre: currentTitle,
          contenu: currentParas.join("\n\n"),
          exactOriginal: true,
        });
        currentTitle = `Développement & Réflexions — Partie ${chapters.length + 1}`;
        currentParas = [];
        currentWords = 0;
      }
    }
  }

  if (currentParas.length > 0) {
    chapters.push({
      titre_chapitre: currentTitle,
      contenu: currentParas.join("\n\n"),
      exactOriginal: true,
    });
  }

  return formatStructuredChaptersToEbook(
    rawText,
    title,
    subtitle,
    chapters,
    totalWords,
    calculatedPages
  );
}

startServer();
