import { supabase } from './supabaseClient';
import {
  Ebook,
  GenerationLog,
  UserProfile,
  CreditTransaction,
  CreditTransactionType,
  CreditPackSchema,
  CreditPurchaseOrderSchema
} from '../types';

export const CATALOGUE_CREDIT_PACKS: CreditPackSchema[] = [
  {
    id: 'pack-starter',
    sku: 'pack_pages_100',
    nom: 'Pack Auteur Vélin',
    pages: 100,
    prix_eur: 19,
    devise: 'EUR',
    description: 'Idéal pour composer 3 à 5 livres structurés avec mise en page soignée.',
    badge: 'Essentiel',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '100 pages de crédits de génération',
      'Accès prioritaire Gemini 3.7 Flash Studio',
      'Exports PDF Haute Définition & Couvertures PNG',
      'Historique des logs et transactions complet',
    ],
  },
  {
    id: 'pack-editor',
    sku: 'pack_pages_500',
    nom: 'Pack Studio Éditeur',
    pages: 500,
    prix_eur: 49,
    devise: 'EUR',
    description: 'Conçu pour les créateurs prolifiques, formateurs et maisons d\'auto-édition.',
    badge: 'Recommandé',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '500 pages de crédits de génération',
      'Vitesse de composition maximale',
      'Découpage automatique multi-chapitres enrichi',
      'Upload Cloudinary raw illimité',
      'Assistance éditoriale dédiée',
    ],
  },
  {
    id: 'pack-master',
    sku: 'pack_pages_1500',
    nom: 'Pack Grand Œuvre',
    pages: 1500,
    prix_eur: 99,
    devise: 'EUR',
    description: 'Volume massif pour collections complètes, manuels techniques et séries.',
    badge: 'Volume Pro',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '1500 pages de vélin garanties',
      'Support multi-auteurs & export batch',
      'Conservation pérenne de tous les états brouillons',
      'API webhook prête pour automatisation',
    ],
  },
];

function throwIfError<T>(result: { data: T; error: any }): T {
  if (result.error) {
    throw new Error(result.error.message || 'Erreur Supabase');
  }
  return result.data;
}

export const storage = {
  async getProfile(profileId: string): Promise<UserProfile> {
    const result = await supabase
      .from('profiles')
      .select('id, name, email, credits_pages, total_credits_utilises, plan_tier')
      .eq('id', profileId)
      .single();
    return throwIfError(result) as UserProfile;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    const result = await supabase
      .from('profiles')
      .update({ name: profile.name, plan_tier: profile.plan_tier, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (result.error) throw new Error(result.error.message);
  },

  async getTransactions(profileId: string): Promise<CreditTransaction[]> {
    const result = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(200);
    return throwIfError(result) as CreditTransaction[];
  },

  // Credits (bonus grants, simulated purchases) go through the server,
  // which is the only caller allowed to invoke apply_credit_transaction
  // (see supabase/migrations/0001_auth_and_persistence.sql) — a direct
  // client-side RPC call is rejected by Postgres regardless of who's
  // signed in, by design. Generation debits are handled entirely
  // server-side inside /api/studio/generate-ebook, not through this path.
  async addCredits(
    profileId: string,
    pages: number,
    typeOrOptions: CreditTransactionType | { type?: CreditTransactionType; description?: string } = 'bonus',
    descriptionParam?: string
  ): Promise<UserProfile> {
    const type: CreditTransactionType = typeof typeOrOptions === 'string' ? typeOrOptions : (typeOrOptions?.type || 'bonus');
    const description: string | undefined = typeof typeOrOptions === 'object' ? typeOrOptions?.description : descriptionParam;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const response = await fetch('/api/studio/credits/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ pages, type, description }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.error || `Échec du crédit de pages (${response.status}).`);
    }

    return this.getProfile(profileId);
  },

  getCreditPacks(): CreditPackSchema[] {
    return CATALOGUE_CREDIT_PACKS;
  },

  preparePurchaseOrder(packSku: string, profileId: string): CreditPurchaseOrderSchema {
    const pack = CATALOGUE_CREDIT_PACKS.find((p) => p.sku === packSku) || CATALOGUE_CREDIT_PACKS[0];
    const order: CreditPurchaseOrderSchema = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      profile_id: profileId,
      pack_sku: pack.sku,
      montant_eur: pack.prix_eur,
      pages_allouees: pack.pages,
      statut: 'draft_prepared',
      provider: 'stripe_ready',
      created_at: new Date().toISOString(),
      metadata: {
        pack_name: pack.nom,
        devise: pack.devise,
        future_checkout_url_placeholder: `/api/studio/purchases/checkout-session?sku=${pack.sku}`,
      },
    };
    return order;
  },

  async getEbooks(profileId: string): Promise<Ebook[]> {
    const result = await supabase
      .from('ebooks')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    return throwIfError(result) as Ebook[];
  },

  async getEbookById(id: string): Promise<Ebook | null> {
    const result = await supabase.from('ebooks').select('*').eq('id', id).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as Ebook | null;
  },

  // Upsert by id. If the ebook has no real DB id yet (freshly generated
  // client-side), pass profileId so we can insert; the returned row's id
  // (DB-generated uuid) should replace the caller's local id.
  async saveEbook(ebook: Ebook, profileId: string): Promise<Ebook> {
    const isNew = !ebook.id || !ebook.id.includes('-') || ebook.id.startsWith('ebk-');
    const row = {
      titre: ebook.titre,
      sous_titre: ebook.sous_titre,
      description: ebook.description,
      statut: ebook.statut,
      source_type: ebook.source_type,
      source_detail: ebook.source_detail,
      plan: ebook.plan,
      contenu: ebook.contenu,
      credits_consommes: ebook.credits_consommes,
      fichier_pdf_url: ebook.fichier_pdf_url,
      cover_image_url: ebook.cover_image_url,
      cover_theme: ebook.cover_theme,
      trim_size: ebook.trim_size,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const result = await supabase
        .from('ebooks')
        .insert({ ...row, profile_id: profileId })
        .select()
        .single();
      return throwIfError(result) as Ebook;
    }

    const result = await supabase
      .from('ebooks')
      .update(row)
      .eq('id', ebook.id)
      .select()
      .single();
    return throwIfError(result) as Ebook;
  },

  async deleteEbook(id: string): Promise<boolean> {
    const result = await supabase.from('ebooks').delete().eq('id', id);
    return !result.error;
  },

  async duplicateEbook(id: string, profileId: string): Promise<Ebook | null> {
    const original = await this.getEbookById(id);
    if (!original) return null;

    const result = await supabase
      .from('ebooks')
      .insert({
        profile_id: profileId,
        titre: `${original.titre} (Copie)`,
        sous_titre: original.sous_titre,
        description: original.description,
        statut: 'draft',
        source_type: original.source_type,
        source_detail: original.source_detail,
        plan: original.plan,
        contenu: original.contenu,
        credits_consommes: original.credits_consommes,
        cover_theme: original.cover_theme,
        trim_size: original.trim_size,
        // Explicitly drop fichier_pdf_url: a duplicate draft shouldn't
        // inherit a "published" PDF pointing at the original's content.
      })
      .select()
      .single();

    if (result.error) {
      console.error('Erreur duplication ebook:', result.error);
      return null;
    }
    return result.data as Ebook;
  },

  async getGenerationLogs(profileId: string): Promise<GenerationLog[]> {
    const result = await supabase
      .from('generation_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })
      .limit(100);
    return throwIfError(result) as GenerationLog[];
  },
};
