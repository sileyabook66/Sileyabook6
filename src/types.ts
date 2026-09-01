import type { BookTrimSizeId } from './lib/bookTrimSizes';
export type { BookTrimSizeId };

export type SourceType = 'youtube' | 'document' | 'prompt' | 'texte_utilisateur';

export type StudioMode = 'ai_generation' | 'layout_raw_text';

export type WritingTone = 'didactique' | 'narratif' | 'essai' | 'guide_pratique' | 'academique' | 'inspirationnel';

export interface SourceInputData {
  sourceType: SourceType;
  studioMode?: StudioMode;
  // Raw User Text source
  rawUserText?: string;
  userBookTitle?: string;
  userBookSubtitle?: string;
  // YouTube source
  youtubeUrl?: string;
  videoTitle?: string;
  videoNotes?: string;
  // Document source
  fileName?: string;
  fileSize?: string;
  fileContent?: string;
  fileMimeType?: string;
  // Prompt source
  promptText?: string;
  // Common options
  targetAudience?: string;
  writingTone: WritingTone;
  estimatedPages: number;
  trimSize?: BookTrimSizeId;
  language: string;
}

export interface Footnote {
  id: string;
  reference_number: number;
  label?: string;
  contenu: string;
  terme_cible?: string;
}

export interface ChapterSection {
  titre: string;
  sous_titre?: string;
  paragraphes: string[];
  notes_de_bas_de_page?: Footnote[];
  callout?: {
    type: 'quote' | 'key_insight' | 'takeaway';
    content: string;
    author?: string;
  };
}

export interface ChapterMetrics {
  wordCount: number;
  characterCount: number;
  sectionsCount: number;
  paragraphsCount: number;
  estimatedPagesA5: number;
  estimatedPagesKdp6x9: number;
  isWithinWordTarget: boolean; // ~2500 words (2350 - 2650)
  isUnder5PagesA5: boolean;    // <= 7.0 pages A5 (at 350 words/page)
  wasSplit?: boolean;
}

export interface Chapter {
  id: string;
  numero: number;
  titre: string;
  resume: string;
  objectifs: string[];
  points_cles: string[];
  sections: ChapterSection[];
  notes_de_bas_de_page?: Footnote[];
  conclusion_chapitre?: string;
  metrics?: ChapterMetrics;
}

export interface EbookMetadata {
  pages_estimees: number;
  mots_total: number;
  temps_lecture_min: number;
  genre: string;
  style: string;
  langue: string;
  tonalite: string;
}

export interface MentionsLegales {
  isbn?: string;
  isbn_ebook?: string;
  depot_legal?: string;
  editeur?: string;
  imprime_par?: string;
  droits_reserves?: string;
  dedicace?: string;
  remerciements?: string;
  biographie_auteur?: string;
  du_meme_auteur?: string[];
}

export interface EbookContenu {
  preface?: string;
  introduction: string;
  chapitres: Chapter[];
  conclusion: string;
  epilogue?: string;
  glossaire?: Array<{ terme: string; definition: string }>;
  mentions_legales?: MentionsLegales;
  metadata: EbookMetadata;
}

export interface EbookSnapshot {
  id: string;
  ebook_id: string;
  label: string;
  created_at: string;
  words_count: number;
  chapters_count: number;
  data: Ebook;
}


export interface Ebook {
  id: string;
  titre: string;
  sous_titre: string;
  description: string;
  statut: 'draft' | 'published' | 'archived';
  source_type: SourceType;
  source_detail: string;
  plan: Array<{
    numero: number;
    titre: string;
    description: string;
  }>;
  contenu: EbookContenu;
  credits_consommes: number;
  fichier_pdf_url?: string;
  cover_image_url?: string;
  cover_theme?: string;
  trim_size?: BookTrimSizeId;
  created_at: string;
  updated_at: string;
}

export interface GenerationLog {
  id: string;
  ebook_id: string;
  ebook_titre: string;
  date: string;
  source_type: SourceType;
  source_detail: string;
  pages_generees: number;
  tokens_utilises: number;
  model_used: string;
  duration_ms: number;
  status: 'success' | 'failed' | 'in_progress';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits_pages: number;
  total_credits_utilises: number;
  plan_tier: 'Découverte' | 'Auteur Pro' | 'Studio Éditeur';
}

export type CreditTransactionType = 'generation' | 'bonus' | 'achat';

export interface CreditTransaction {
  id: string;
  profile_id: string;
  montant: number; // Montant en pages : négatif pour débit de génération (ex: -15), positif pour crédit (ex: +50)
  type: CreditTransactionType;
  description?: string;
  ebook_id?: string;
  balance_after?: number;
  created_at: string;
}

export type PurchaseStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'draft_prepared';

export interface CreditPackSchema {
  id: string;
  sku: string;
  nom: string;
  pages: number;
  prix_eur: number;
  devise: 'EUR';
  description: string;
  badge?: string;
  statut: 'catalogue_pret' | 'bientot_disponible';
  fonctionnalites: string[];
}

export interface CreditPurchaseOrderSchema {
  id: string;
  profile_id: string;
  pack_sku: string;
  montant_eur: number;
  pages_allouees: number;
  statut: PurchaseStatus;
  provider: 'stripe_ready' | 'simulated' | 'manual';
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface GenerationProgressStep {
  id: string;
  label: string;
  detail: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: string;
}
