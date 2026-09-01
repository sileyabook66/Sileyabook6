export type BookTrimSizeId =
  | '5x8'
  | '5.06x7.81'
  | '5.25x8'
  | '5.5x8.5'
  | '5.83x8.27_a5'
  | '6x9'
  | '6.14x9.21'
  | '6.69x9.61'
  | '7x10'
  | '8x10'
  | '8.25x8.25'
  | '8.5x8.5'
  | '8.5x11'
  | '8.27x11.69_a4';

export type TrimCategory = 'tous' | 'popular' | 'romans' | 'guides' | 'grands_formats' | 'carres';

export interface BookTrimSize {
  id: BookTrimSizeId;
  name: string;
  inches: string;
  cm: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height (e.g., 0.667 for 6x9)
  category: 'popular' | 'romans' | 'guides' | 'grands_formats' | 'carres';
  categoryLabel: string;
  usage: string;
  description: string;
  isPopular?: boolean;
  isKdpStandard: boolean;
  kdpNote?: string;
  minPages: number;
  maxPages: number;
  recommendedMarginMm: number;
  bodyFontSizePt: number;
  titleFontSizePt: number;
  h2FontSizePt: number;
}

export const BOOK_TRIM_SIZES: BookTrimSize[] = [
  {
    id: '6x9',
    name: '6 × 9" (15,24 × 22,86 cm)',
    inches: '6 × 9"',
    cm: '15,24 × 22,86 cm',
    widthMm: 152.4,
    heightMm: 228.6,
    aspectRatio: 152.4 / 228.6,
    category: 'popular',
    categoryLabel: 'Recommandé & Populaire',
    usage: 'Vente en ligne, réseaux sociaux, Amazon KDP & guides pratiques',
    description: 'Le format standard universel pour vendre vos ebooks sur votre site, Selar, Gumroad ou via Facebook Ads, tout en restant 100% compatible Amazon KDP.',
    isPopular: true,
    isKdpStandard: true,
    kdpNote: 'Standard mondial KDP par défaut (Broché & Relié)',
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 15,
    bodyFontSizePt: 10,
    titleFontSizePt: 22,
    h2FontSizePt: 13,
  },
  {
    id: '5.5x8.5',
    name: '5,5 × 8,5" (13,97 × 21,59 cm)',
    inches: '5,5 × 8,5"',
    cm: '13,97 × 21,59 cm',
    widthMm: 139.7,
    heightMm: 215.9,
    aspectRatio: 139.7 / 215.9,
    category: 'guides',
    categoryLabel: 'Livres & Guides',
    usage: 'Livres, essais et guides pratiques (Demi-Letter / Digest)',
    description: 'Format américain classique très apprécié pour les ouvrages pratiques, le développement personnel et les récits.',
    isPopular: true,
    isKdpStandard: true,
    kdpNote: 'Standard KDP très répandu',
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 14,
    bodyFontSizePt: 9.8,
    titleFontSizePt: 20,
    h2FontSizePt: 12.5,
  },
  {
    id: '5x8',
    name: '5 × 8" (12,7 × 20,32 cm)',
    inches: '5 × 8"',
    cm: '12,7 × 20,32 cm',
    widthMm: 127.0,
    heightMm: 203.2,
    aspectRatio: 127.0 / 203.2,
    category: 'romans',
    categoryLabel: 'Romans & Récits',
    usage: 'Romans, littérature, autobiographies de poche, ebooks imprimés',
    description: 'Format compact et maniable, idéal pour les romans de fiction, poésies et mémoires personnels.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 13,
    bodyFontSizePt: 9.5,
    titleFontSizePt: 19,
    h2FontSizePt: 12,
  },
  {
    id: '5.06x7.81',
    name: '5,06 × 7,81" (12,85 × 19,84 cm)',
    inches: '5,06 × 7,81"',
    cm: '12,85 × 19,84 cm',
    widthMm: 128.5,
    heightMm: 198.4,
    aspectRatio: 128.5 / 198.4,
    category: 'romans',
    categoryLabel: 'Romans & Récits',
    usage: 'Romans de littérature générale et fiction',
    description: 'Format traditionnel de poche anglo-saxon (B-Format), très élégant en main.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 13,
    bodyFontSizePt: 9.5,
    titleFontSizePt: 19,
    h2FontSizePt: 12,
  },
  {
    id: '5.25x8',
    name: '5,25 × 8" (13,34 × 20,32 cm)',
    inches: '5,25 × 8"',
    cm: '13,34 × 20,32 cm',
    widthMm: 133.4,
    heightMm: 203.2,
    aspectRatio: 133.4 / 203.2,
    category: 'guides',
    categoryLabel: 'Livres Pratiques',
    usage: 'Livres pratiques, manuels compacts et carnets',
    description: 'Offre une largeur légèrement accrue pour une mise en page aérée des listes et points clés.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 13.5,
    bodyFontSizePt: 9.6,
    titleFontSizePt: 19.5,
    h2FontSizePt: 12.2,
  },
  {
    id: '5.83x8.27_a5',
    name: '5,83 × 8,27" / A5 (14,8 × 21 cm)',
    inches: '5,83 × 8,27"',
    cm: '14,8 × 21 cm',
    widthMm: 148.0,
    heightMm: 210.0,
    aspectRatio: 148.0 / 210.0,
    category: 'popular',
    categoryLabel: 'Standard Européen (A5)',
    usage: 'Ebooks digitaux, vente sur site web, lecture smartphone/tablette & KDP Europe',
    description: 'Le format roi pour la lecture numérique sur tablette et mobile. Idéal pour les guides pratiques vendus directement en PDF ou EPUB.',
    isPopular: true,
    isKdpStandard: true,
    kdpNote: 'Correspond au format A5 sur Amazon KDP Europe',
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 14.5,
    bodyFontSizePt: 9.8,
    titleFontSizePt: 21,
    h2FontSizePt: 12.8,
  },
  {
    id: '6.14x9.21',
    name: '6,14 × 9,21" (15,6 × 23,39 cm)',
    inches: '6,14 × 9,21"',
    cm: '15,6 × 23,39 cm',
    widthMm: 156.0,
    heightMm: 233.9,
    aspectRatio: 156.0 / 233.9,
    category: 'grands_formats',
    categoryLabel: 'Livres Grand Format',
    usage: 'Livres grand format, essais historiques & biographies (Royal Octavo)',
    description: 'Format d’édition noble offrant de grandes marges et une typographie prestigieuse.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 16,
    bodyFontSizePt: 10.2,
    titleFontSizePt: 23,
    h2FontSizePt: 13.5,
  },
  {
    id: '6.69x9.61',
    name: '6,69 × 9,61" (16,99 × 24,41 cm)',
    inches: '6,69 × 9,61"',
    cm: '16,99 × 24,41 cm',
    widthMm: 169.9,
    heightMm: 244.1,
    aspectRatio: 169.9 / 244.1,
    category: 'grands_formats',
    categoryLabel: 'Livres Grand Format',
    usage: 'Livres grand format, beaux livres et traités (Crown Quarto)',
    description: 'Spacieux et généreux, parfait pour intégrer schémas, notes latérales et encadrés.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 17,
    bodyFontSizePt: 10.5,
    titleFontSizePt: 24,
    h2FontSizePt: 14,
  },
  {
    id: '7x10',
    name: '7 × 10" (17,78 × 25,4 cm)',
    inches: '7 × 10"',
    cm: '17,78 × 25,4 cm',
    widthMm: 177.8,
    heightMm: 254.0,
    aspectRatio: 177.8 / 254.0,
    category: 'guides',
    categoryLabel: 'Guides & Formations',
    usage: 'Guides pratiques, classeurs de formation, workbooks et manuels',
    description: 'Format très apprécié pour les formations professionnelles, classeurs de coaching et cours méthodologiques.',
    isPopular: true,
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 17.5,
    bodyFontSizePt: 10.5,
    titleFontSizePt: 25,
    h2FontSizePt: 14.5,
  },
  {
    id: '8x10',
    name: '8 × 10" (20,32 × 25,4 cm)',
    inches: '8 × 10"',
    cm: '20,32 × 25,4 cm',
    widthMm: 203.2,
    heightMm: 254.0,
    aspectRatio: 203.2 / 254.0,
    category: 'grands_formats',
    categoryLabel: 'Livres Illustrés',
    usage: 'Livres illustrés, albums, livres de cuisine et portfolios',
    description: 'Large surface d’impression valorisant les illustrations haute définition et doubles pages.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 18,
    bodyFontSizePt: 10.5,
    titleFontSizePt: 25,
    h2FontSizePt: 15,
  },
  {
    id: '8.25x8.25',
    name: '8,25 × 8,25" (20,95 × 20,95 cm)',
    inches: '8,25 × 8,25"',
    cm: '20,95 × 20,95 cm',
    widthMm: 209.5,
    heightMm: 209.5,
    aspectRatio: 1.0,
    category: 'carres',
    categoryLabel: 'Formats Carrés',
    usage: 'Livres jeunesse, livres d’art, citations, recueils visuels',
    description: 'Format carré moderne et ludique supporté par Amazon KDP pour livres d’images et guides visuels.',
    isKdpStandard: true,
    kdpNote: 'Format carré KDP officiel',
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 16,
    bodyFontSizePt: 10.2,
    titleFontSizePt: 22,
    h2FontSizePt: 13.5,
  },
  {
    id: '8.5x8.5',
    name: '8,5 × 8,5" (21,59 × 21,59 cm)',
    inches: '8,5 × 8,5"',
    cm: '21,59 × 21,59 cm',
    widthMm: 215.9,
    heightMm: 215.9,
    aspectRatio: 1.0,
    category: 'carres',
    categoryLabel: 'Formats Carrés',
    usage: 'Format carré KDP grand modèle pour albums et carnets créatifs',
    description: 'Très populaire sur Amazon pour les carnets d’activités, livres de coloriage et portfolios photos.',
    isKdpStandard: true,
    kdpNote: 'Format carré KDP officiel',
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 16.5,
    bodyFontSizePt: 10.2,
    titleFontSizePt: 22,
    h2FontSizePt: 13.5,
  },
  {
    id: '8.5x11',
    name: '8,5 × 11" (21,59 × 27,94 cm)',
    inches: '8,5 × 11"',
    cm: '21,59 × 27,94 cm',
    widthMm: 215.9,
    heightMm: 279.4,
    aspectRatio: 215.9 / 279.4,
    category: 'grands_formats',
    categoryLabel: 'Grands Formats & Manuels',
    usage: 'Manuels d’étude, cahiers d’exercices, grand format US Letter',
    description: 'Format standard US Letter, idéal pour les supports de cours complets, dossiers d’entreprise et classeurs.',
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 19,
    bodyFontSizePt: 10.8,
    titleFontSizePt: 26,
    h2FontSizePt: 15,
  },
  {
    id: '8.27x11.69_a4',
    name: '8,27 × 11,69" / A4 (21 × 29,7 cm)',
    inches: '8,27 × 11,69"',
    cm: '21 × 29,7 cm',
    widthMm: 210.0,
    heightMm: 297.0,
    aspectRatio: 210.0 / 297.0,
    category: 'grands_formats',
    categoryLabel: 'Standard Téléchargement A4',
    usage: 'Téléchargements directs PDF, fiches d’action, classeurs et manuels officiels',
    description: 'Le format standard universel d’impression et de téléchargement PDF direct pour ordinateurs et tablettes.',
    isPopular: true,
    isKdpStandard: true,
    minPages: 24,
    maxPages: 828,
    recommendedMarginMm: 20,
    bodyFontSizePt: 11,
    titleFontSizePt: 27,
    h2FontSizePt: 15.5,
  },
];

export const DEFAULT_TRIM_SIZE_ID: BookTrimSizeId = '6x9';

/**
 * Returns the matching BookTrimSize definition or fallback to 6x9"
 */
export function getTrimSize(id?: string): BookTrimSize {
  if (!id) return BOOK_TRIM_SIZES[0]; // 6x9 is index 0
  const found = BOOK_TRIM_SIZES.find((s) => s.id === id);
  if (found) return found;
  
  // Normalization aliases
  if (id.toLowerCase().includes('a4')) return getTrimSize('8.27x11.69_a4');
  if (id.toLowerCase().includes('a5')) return getTrimSize('5.83x8.27_a5');
  if (id.includes('6x9') || id.includes('6*9')) return getTrimSize('6x9');
  if (id.includes('5.5x8.5')) return getTrimSize('5.5x8.5');
  if (id.includes('5x8')) return getTrimSize('5x8');
  if (id.includes('7x10')) return getTrimSize('7x10');
  
  return BOOK_TRIM_SIZES[0];
}

/**
 * Calculates estimated spine thickness (tranche / dos du livre) for Amazon KDP Paperback
 * White paper: ~0.0572 mm / page
 * Cream paper: ~0.0635 mm / page
 * Color paper: ~0.0596 mm / page
 */
export function calculateSpineThicknessMm(
  pageCount: number,
  paperType: 'white' | 'cream' | 'color' = 'white'
): number {
  const safePages = Math.max(pageCount || 24, 24);
  const thicknessPerPage = {
    white: 0.0572,
    cream: 0.0635,
    color: 0.0596,
  }[paperType];

  return Number((safePages * thicknessPerPage).toFixed(2));
}

export function validateKdpPageCount(pageCount: number): {
  isValid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
} {
  if (pageCount < 24) {
    return {
      isValid: false,
      message: `Amazon KDP requiert au minimum 24 pages pour un livre broché (Actuel : ${pageCount} p.).`,
      severity: 'warning',
    };
  }
  if (pageCount > 828) {
    return {
      isValid: false,
      message: `Amazon KDP limite le broché à 828 pages maximum (Actuel : ${pageCount} p.).`,
      severity: 'error',
    };
  }
  return {
    isValid: true,
    message: `Conforme Amazon KDP (${pageCount} pages, compris entre 24 et 828 pages).`,
    severity: 'success',
  };
}

/**
 * Amazon KDP Cover Dimensions & Bleed Calculations
 */
export interface KdpCoverDimensions {
  bleedMm: number; // 3.2 mm (0.125")
  spineWidthMm: number;
  frontWidthMm: number;
  backWidthMm: number;
  bookHeightMm: number;
  totalWidthMm: number;
  totalHeightMm: number;
  totalWidthPx300Dpi: number;
  totalHeightPx300Dpi: number;
  isSpineTextEligible: boolean; // 79+ pages
  spineTextWarning?: string;
  foldLineLeftMm: number; // Back cover right / spine left
  foldLineRightMm: number; // Spine right / front cover left
  safeZoneMarginMm: number;
  barcodeLocation: {
    xMm: number;
    yMm: number;
    widthMm: number;
    heightMm: number;
  };
}

export function calculateKdpCoverDimensions(
  trimId: BookTrimSizeId | undefined,
  pageCount: number,
  paperType: 'white' | 'cream' | 'color' = 'white'
): KdpCoverDimensions {
  const trim = getTrimSize(trimId);
  const bleedMm = 3.2; // 0.125" standard KDP bleed
  const spineWidthMm = calculateSpineThicknessMm(pageCount, paperType);
  const safeZoneMarginMm = 3.2; // Inside trim line

  const totalWidthMm = Number((bleedMm + trim.widthMm + spineWidthMm + trim.widthMm + bleedMm).toFixed(2));
  const totalHeightMm = Number((bleedMm + trim.heightMm + bleedMm).toFixed(2));

  // 300 DPI conversion: mm * 300 / 25.4
  const mmToPx300 = (mm: number) => Math.round((mm * 300) / 25.4);
  const totalWidthPx300Dpi = mmToPx300(totalWidthMm);
  const totalHeightPx300Dpi = mmToPx300(totalHeightMm);

  const isSpineTextEligible = (pageCount || 0) >= 79;
  const spineTextWarning = !isSpineTextEligible
    ? `Amazon KDP autorise le texte sur la tranche uniquement à partir de 79 pages (Actuel : ${pageCount || 24} p., tranche de ${spineWidthMm} mm).`
    : undefined;

  const foldLineLeftMm = Number((bleedMm + trim.widthMm).toFixed(2));
  const foldLineRightMm = Number((foldLineLeftMm + spineWidthMm).toFixed(2));

  // Barcode default location on back cover (bottom-right of back cover, safe zone)
  const barcodeWidthMm = 50.8; // 2 inches
  const barcodeHeightMm = 30.5; // 1.2 inches
  const barcodeXMm = Number((foldLineLeftMm - barcodeWidthMm - 6.5).toFixed(2));
  const barcodeYMm = Number((totalHeightMm - bleedMm - barcodeHeightMm - 6.5).toFixed(2));

  return {
    bleedMm,
    spineWidthMm,
    frontWidthMm: trim.widthMm,
    backWidthMm: trim.widthMm,
    bookHeightMm: trim.heightMm,
    totalWidthMm,
    totalHeightMm,
    totalWidthPx300Dpi,
    totalHeightPx300Dpi,
    isSpineTextEligible,
    spineTextWarning,
    foldLineLeftMm,
    foldLineRightMm,
    safeZoneMarginMm,
    barcodeLocation: {
      xMm: barcodeXMm,
      yMm: barcodeYMm,
      widthMm: barcodeWidthMm,
      heightMm: barcodeHeightMm,
    },
  };
}

