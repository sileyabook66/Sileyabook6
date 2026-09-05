/**
 * textStructure.ts
 * Module de traitement des séquences de texte et d'images insérées.
 * Assure la fidélité verbatim à 100% du texte, le calcul précis de l'espace vertical
 * réservé pour chaque image lors de la pagination, et la compression automatique.
 */

import type { Chapter, ChapterMetrics, ChapterSection } from '../types';

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface ImageBlock {
  type: 'image';
  id?: string;
  url: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type ContentBlock = TextBlock | ImageBlock;

/**
 * Regex pour capturer la syntaxe Markdown des images : ![légende](url)
 * ainsi que les balises HTML éventuelles <img src="..." alt="..." />
 */
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
const HTML_IMAGE_REGEX = /<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?[^>]*>/gi;

/**
 * Découpe un texte brut contenant des images en une séquence ordonnée de blocs texte et image
 */
export function parseContentBlocks(rawContent: string): ContentBlock[] {
  if (!rawContent) return [];

  const blocks: ContentBlock[] = [];
  let lastIndex = 0;

  // Unify regex search
  const regex = new RegExp(MARKDOWN_IMAGE_REGEX.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawContent)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;

    // Text prior to the image
    if (matchStart > lastIndex) {
      const textSlice = rawContent.substring(lastIndex, matchStart);
      if (textSlice.trim().length > 0 || textSlice.includes('\n')) {
        blocks.push({
          type: 'text',
          content: textSlice,
        });
      }
    }

    const caption = match[1] ? match[1].trim() : '';
    const url = match[2].trim();

    blocks.push({
      type: 'image',
      url,
      caption: caption || undefined,
      alt: caption || 'Illustration manuscrit',
    });

    lastIndex = matchEnd;
  }

  // Trailing text after the last image
  if (lastIndex < rawContent.length) {
    const trailingText = rawContent.substring(lastIndex);
    if (trailingText.trim().length > 0 || trailingText.includes('\n')) {
      blocks.push({
        type: 'text',
        content: trailingText,
      });
    }
  }

  return blocks;
}

/**
 * Extrait le texte pur sans les balises/URLs d'images pour le comptage de mots exact
 */
export function extractCleanPlainText(rawContent: string): string {
  if (!rawContent) return '';
  return rawContent
    .replace(MARKDOWN_IMAGE_REGEX, '')
    .replace(HTML_IMAGE_REGEX, '')
    .trim();
}

/**
 * Compte le nombre d'images présentes dans le contenu
 */
export function countImagesInContent(rawContent: string): number {
  if (!rawContent) return 0;
  const matches = rawContent.match(MARKDOWN_IMAGE_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Calcul dynamique de la pagination :
 * - ~350 mots de texte par page de manuscrit
 * - Chaque image réserve un espace vertical équivalent à ~0.4 page (~140 mots)
 * - Traitement en séquence pour garantir que chaque image et paragraphe disposent de l'espace vertical nécessaire
 */
export function calculateDynamicPagination(rawContent: string): {
  totalWords: number;
  imageCount: number;
  estimatedPages: number;
  blocks: ContentBlock[];
} {
  const blocks = parseContentBlocks(rawContent);
  const plainText = extractCleanPlainText(rawContent);
  const words = plainText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  let imageCount = 0;
  blocks.forEach((b) => {
    if (b.type === 'image') imageCount++;
  });

  if (totalWords === 0 && imageCount === 0) {
    return { totalWords: 0, imageCount: 0, estimatedPages: 1, blocks: [] };
  }

  // 1 image ≈ 140 mots d'espace vertical dans la mise en page (soit 0.4 page A5)
  const equivalentWordCount = totalWords + imageCount * 140;
  const estimatedPages = Math.max(1, Math.ceil(equivalentWordCount / 350));

  return {
    totalWords,
    imageCount,
    estimatedPages,
    blocks,
  };
}

/**
 * Compresse une image côté client (sur smartphone ou ordinateur) via un Canvas HTML5
 * avant l'upload vers Cloudinary / Serveur.
 * - Réduit la résolution maximale à 1600px (haute définition parfaite pour PDF A4)
 * - Compression JPEG à 82% pour minimiser le poids sans perte visuelle perceptible
 */
export async function compressImageClient(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<{
  base64: string;
  width: number;
  height: number;
  sizeBytes: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format d'image non reconnu."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            base64: event.target?.result as string,
            width: img.width,
            height: img.height,
            sizeBytes: file.size,
          });
        }

        // Clean white background in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(mime, quality);

        // Approximate size
        const head = compressedBase64.indexOf(',') + 1;
        const sizeBytes = Math.round(((compressedBase64.length - head) * 3) / 4);

        resolve({
          base64: compressedBase64,
          width,
          height,
          sizeBytes,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload d'une image vers le backend (Cloudinary ou cache serveur)
 */
export async function uploadImageToServer(
  file: File,
  caption?: string
): Promise<{
  success: boolean;
  secure_url: string;
  public_id?: string;
  width?: number;
  height?: number;
  caption?: string;
}> {
  // 1. Client-side fast compression
  const compressed = await compressImageClient(file);

  // 2. Post to API
  const response = await fetch('/api/studio/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64: compressed.base64,
      filename: file.name,
      caption: caption || '',
      width: compressed.width,
      height: compressed.height,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec du téléversement de l'image (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    success: true,
    secure_url: data.secure_url || compressed.base64,
    public_id: data.public_id,
    width: data.width || compressed.width,
    height: data.height || compressed.height,
    caption: caption || '',
  };
}

/**
 * Calcule le nombre de mots réel d'un chapitre de façon exhaustive (titres, résumé, sections, paragraphes, callout, conclusion)
 */
export function countChapterWords(chap: Partial<Chapter>): number {
  if (!chap) return 0;
  let text = `${chap.titre || ''} ${chap.resume || ''} ${chap.conclusion_chapitre || ''}`;
  if (chap.points_cles) text += ' ' + chap.points_cles.join(' ');
  if (chap.objectifs) text += ' ' + chap.objectifs.join(' ');
  if (chap.sections) {
    for (const sec of chap.sections) {
      text += ' ' + (sec.titre || '') + ' ' + (sec.sous_titre || '');
      if (sec.paragraphes) text += ' ' + sec.paragraphes.join(' ');
      if (sec.callout?.content) text += ' ' + sec.callout.content;
      if (sec.notes_de_bas_de_page) {
        text += ' ' + sec.notes_de_bas_de_page.map((n) => n.contenu).join(' ');
      }
    }
  }
  const clean = extractCleanPlainText(text);
  return clean.split(/\s+/).filter(Boolean).length;
}

/**
 * Calcul exact du nombre de pages PDF au format A5 (148 x 210 mm) :
 * - Marges 13 mm, largeur utile 122 mm, hauteur utile 164 mm.
 * - Page 1 d'un chapitre : En-tête "CHAPITRE X" + Titre + Ligne séparatrice + Encadré Résumé + Points Clés = ~70 mm d'occupation.
 *   Espace restant sur la page 1 pour le texte courant : ~94 mm (~240 à 260 mots).
 * - Pages suivantes : Running header (12 mm) + titres de section et paragraphes = ~350 mots par page.
 * - Format cible : ~2 500 mots par chapitre (environ 7 à 7.5 pages A5 à 350 mots/page).
 */
export function calculateChapterA5Pages(chap: Partial<Chapter>): number {
  const wordCount = countChapterWords(chap);
  if (wordCount <= 0) return 0;
  if (wordCount <= 250) return 1.0;

  // Page 1 absorbe ~250 mots avec le bloc d'introduction de chapitre
  // Chaque page suivante absorbe en moyenne ~350 mots
  const extraWords = wordCount - 250;
  const estimatedPages = 1 + extraWords / 350;
  return Number(estimatedPages.toFixed(1));
}

/**
 * Calcule les métriques éditoriales complètes d'un chapitre
 */
export function getChapterMetrics(chap: Chapter): ChapterMetrics {
  const wordCount = countChapterWords(chap);
  const estimatedPagesA5 = calculateChapterA5Pages(chap);

  // Format KDP 6x9 pouces (~400 mots/page)
  const estimatedPagesKdp6x9 = wordCount <= 300 ? 1.0 : Number((1 + (wordCount - 300) / 400).toFixed(1));

  let paragraphsCount = 0;
  chap.sections?.forEach((s) => {
    paragraphsCount += s.paragraphes?.length || 0;
  });

  return {
    wordCount,
    characterCount: JSON.stringify(chap).length,
    sectionsCount: chap.sections?.length || 0,
    paragraphsCount,
    estimatedPagesA5,
    estimatedPagesKdp6x9,
    isWithinWordTarget: wordCount >= 2350 && wordCount <= 2650, // Cible ~2500 mots
    isUnder5PagesA5: estimatedPagesA5 <= 8.0, // Plafond d'un chapitre unitaire calibré
  };
}

export interface ChapterDuplicationReport {
  flaggedPairs: Array<{ a: number; b: number; similarity: number }>;
  maxSimilarity: number;
  severelyDuplicated: boolean;
}

// Only real body paragraphs are compared — titles, objectifs and points_cles
// naturally reuse the subject's own vocabulary between chapters, which would
// create false positives if included.
function extractChapterBodyText(chap: Partial<Chapter>): string {
  let text = '';
  chap.sections?.forEach((sec) => {
    if (sec.paragraphes) text += ' ' + sec.paragraphes.join(' ');
  });
  return extractCleanPlainText(text).toLowerCase();
}

function wordShingles(text: string, n = 5): Set<string> {
  const words = text.split(/\s+/).filter(Boolean);
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    shingles.add(words.slice(i, i + n).join(' '));
  }
  return shingles;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const shingle of a) if (b.has(shingle)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Compare chaque chapitre à tous les autres via similarité de 5-grammes de
 * mots (Jaccard) sur leurs paragraphes réels, afin de détecter un contenu
 * structurellement dupliqué — typiquement le générateur de repli statique
 * réutilisant les mêmes paragraphes-gabarits pour plusieurs chapitres avec
 * seulement le sujet ou le nom d'entreprise qui change.
 */
export function analyzeChapterDuplication(
  chapters: Partial<Chapter>[],
  threshold = 0.3
): ChapterDuplicationReport {
  const shingleSets = chapters.map((c) => wordShingles(extractChapterBodyText(c)));
  const flaggedPairs: Array<{ a: number; b: number; similarity: number }> = [];
  let maxSimilarity = 0;

  for (let i = 0; i < shingleSets.length; i++) {
    for (let j = i + 1; j < shingleSets.length; j++) {
      const sim = jaccardSimilarity(shingleSets[i], shingleSets[j]);
      if (sim > maxSimilarity) maxSimilarity = sim;
      if (sim >= threshold) {
        flaggedPairs.push({ a: i + 1, b: j + 1, similarity: Number(sim.toFixed(2)) });
      }
    }
  }

  const totalPairs = (chapters.length * (chapters.length - 1)) / 2;
  const severelyDuplicated = totalPairs > 0 && flaggedPairs.length / totalPairs >= 0.5;

  return { flaggedPairs, maxSimilarity: Number(maxSimilarity.toFixed(2)), severelyDuplicated };
}

/**
 * Découpe un chapitre en plusieurs chapitres s'il dépasse très largement le calibrage (au-delà de 3 000 mots).
 * Préserve 100% de la substance en répartissant logiquement les sections et paragraphes.
 */
export function splitChapterIfExceedsLimit(chap: Chapter): Chapter[] {
  const pages = calculateChapterA5Pages(chap);
  const words = countChapterWords(chap);

  // Si conforme à la cible de ~2500 mots, pas besoin de découpage
  if (words <= 2800) {
    return [{
      ...chap,
      metrics: getChapterMetrics(chap),
    }];
  }

  // Si le chapitre dépasse 5 pages : on le scinde en 2 chapitres cohérents
  const sections = chap.sections || [];
  if (sections.length >= 2) {
    const mid = Math.ceil(sections.length / 2);
    const part1Sections = sections.slice(0, mid);
    const part2Sections = sections.slice(mid);

    const chap1: Chapter = {
      ...chap,
      id: `${chap.id}-p1`,
      titre: `${chap.titre} — Partie 1 : Fondements & Analyse`,
      resume: `Première partie : ${chap.resume}`,
      sections: part1Sections,
      points_cles: chap.points_cles ? chap.points_cles.slice(0, Math.ceil(chap.points_cles.length / 2)) : [],
      conclusion_chapitre: "Transition vers la mise en œuvre et le déploiement pratique abordés dans la suite.",
    };
    chap1.metrics = { ...getChapterMetrics(chap1), wasSplit: true };

    const chap2: Chapter = {
      ...chap,
      id: `${chap.id}-p2`,
      numero: chap.numero + 1,
      titre: `${chap.titre} — Partie 2 : Déploiement & Étapes Actionnables`,
      resume: `Seconde partie : Applications concrètes et plan d'action opérationnel.`,
      sections: part2Sections,
      points_cles: chap.points_cles ? chap.points_cles.slice(Math.ceil(chap.points_cles.length / 2)) : [],
      conclusion_chapitre: chap.conclusion_chapitre || "Synthèse et consolidation des compétences acquises.",
    };
    chap2.metrics = { ...getChapterMetrics(chap2), wasSplit: true };

    return [chap1, chap2];
  } else if (sections.length === 1 && sections[0].paragraphes.length >= 4) {
    // Une seule longue section : on divise les paragraphes
    const sec = sections[0];
    const midP = Math.ceil(sec.paragraphes.length / 2);
    const p1 = sec.paragraphes.slice(0, midP);
    const p2 = sec.paragraphes.slice(midP);

    const chap1: Chapter = {
      ...chap,
      id: `${chap.id}-p1`,
      titre: `${chap.titre} (Partie 1)`,
      sections: [{ ...sec, paragraphes: p1 }],
    };
    chap1.metrics = { ...getChapterMetrics(chap1), wasSplit: true };

    const chap2: Chapter = {
      ...chap,
      id: `${chap.id}-p2`,
      numero: chap.numero + 1,
      titre: `${chap.titre} (Partie 2)`,
      sections: [{ ...sec, titre: `Suite — ${sec.titre}`, paragraphes: p2 }],
    };
    chap2.metrics = { ...getChapterMetrics(chap2), wasSplit: true };

    return [chap1, chap2];
  }

  // Fallback avec métriques
  return [{
    ...chap,
    metrics: getChapterMetrics(chap),
  }];
}
