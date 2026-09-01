import { Ebook } from '../types';
import { calculateSpineThicknessMm, BookTrimSizeId, getTrimSize } from './bookTrimSizes';


export interface KdpKeywordSuggestion {
  keyword: string;
  category: string;
  intent: string;
}

export interface KdpCategorySuggestion {
  path: string;
  bisacCode: string;
  audience: string;
}

export interface RoyaltyCalculation {
  retailPrice: number;
  printCostEur: number;
  royalty70Eur: number;
  royalty35Eur: number;
  breakEvenPrice: number;
}

/**
 * Calculates Amazon KDP Paperback Printing Cost in Europe (€)
 * Standard KDP formula (France / EU):
 * Fixed cost: 0.60 € + (0.012 € * pageCount) for Black & White standard
 */
export function calculateKdpPrintCost(pageCount: number, isColor: boolean = false): number {
  const safePages = Math.max(24, pageCount);
  if (isColor) {
    return Math.round((0.85 + safePages * 0.045) * 100) / 100;
  }
  return Math.round((0.60 + safePages * 0.012) * 100) / 100;
}

/**
 * Calculates Royalties for a given retail price in Euros
 */
export function calculateKdpRoyalties(
  retailPrice: number,
  pageCount: number,
  isPaperback: boolean = true,
  isColor: boolean = false
): RoyaltyCalculation {
  const printCost = isPaperback ? calculateKdpPrintCost(pageCount, isColor) : 0;
  const breakEven = isPaperback ? Math.round((printCost / 0.6) * 100) / 100 : 0.99;

  // Paperback 60% royalty rate minus printing cost: (Price * 0.60) - PrintCost
  const paperbackRoyalty = Math.max(0, Math.round(((retailPrice * 0.60) - printCost) * 100) / 100);

  // Kindle eBook: 70% (between 2.99€ and 9.99€) or 35%
  const ebookRoyalty70 = Math.max(0, Math.round((retailPrice * 0.70) * 100) / 100);
  const ebookRoyalty35 = Math.max(0, Math.round((retailPrice * 0.35) * 100) / 100);

  return {
    retailPrice,
    printCostEur: printCost,
    royalty70Eur: isPaperback ? paperbackRoyalty : ebookRoyalty70,
    royalty35Eur: isPaperback ? Math.max(0, Math.round(((retailPrice * 0.40) - printCost) * 100) / 100) : ebookRoyalty35,
    breakEvenPrice: breakEven,
  };
}

/**
 * Generates formatted Amazon KDP compliant HTML Description
 */
export function generateAmazonHtmlDescription(ebook: Ebook, authorName: string = 'Auteur'): string {
  const title = ebook.titre || 'Titre du livre';
  const subtitle = ebook.sous_titre ? ` - ${ebook.sous_titre}` : '';
  const desc = ebook.description || '';
  const chapters = ebook.contenu.chapitres || [];

  let html = `<h2><strong>${title}${subtitle}</strong></h2>\n\n`;
  html += `<p><em>Par ${authorName}</em></p>\n\n`;

  if (desc) {
    html += `<p>${desc.replace(/\n\n/g, '</p>\n<p>')}</p>\n\n`;
  }

  if (chapters.length > 0) {
    html += `<h3><strong>Ce que vous allez découvrir dans cet ouvrage :</strong></h3>\n<ul>\n`;
    chapters.slice(0, 7).forEach((chap) => {
      html += `  <li><strong>Chapitre ${chap.numero} : ${chap.titre}</strong> — ${chap.resume || 'Découvrez les clés indispensables.'}</li>\n`;
    });
    html += `</ul>\n\n`;
  }

  html += `<p><strong>Commandez votre exemplaire dès aujourd'hui et commencez votre lecture !</strong></p>`;
  return html;
}

/**
 * Generates 7 Strategic KDP Keywords
 */
export function generateKdpKeywords(ebook: Ebook): string[] {
  const keywords: string[] = [];
  const genre = ebook.contenu.metadata?.genre || 'Essai & Guide Pratique';
  const titleWords = ebook.titre.split(/\s+/).filter((w) => w.length > 3);
  
  if (titleWords.length > 0) {
    keywords.push(`guide ${titleWords[0].toLowerCase()} pratique`);
  }
  keywords.push(`${genre.toLowerCase()} livre`);
  keywords.push(`méthode complète ${titleWords[1] ? titleWords[1].toLowerCase() : 'réussite'}`);
  keywords.push(`apprendre ${ebook.titre.slice(0, 25).toLowerCase()}`);
  keywords.push(`manuel de référence livre broché`);
  keywords.push(`conseils et stratégies approfondies`);
  keywords.push(`meilleur livre autoédition amazon`);

  return keywords.slice(0, 7);
}

/**
 * Suggests BISAC / KDP categories
 */
export function getRecommendedKdpCategories(genre?: string): KdpCategorySuggestion[] {
  return [
    {
      path: 'Livres > Entreprise et Bourse > Gestion et Management',
      bisacCode: 'BUS071000',
      audience: 'Professionnels, Dirigeants & Étudiants',
    },
    {
      path: 'Livres > Développement personnel > Efficacité et Réussite',
      bisacCode: 'SEL021000',
      audience: 'Grand public & Auteurs',
    },
    {
      path: 'Livres > Sciences humaines et sociales > Essais et Société',
      bisacCode: 'SOC000000',
      audience: 'Lecteurs avertis & Universitaires',
    },
    {
      path: 'Livres > Informatique et Internet > Nouvelles Technologies',
      bisacCode: 'COM000000',
      audience: 'Ingénieurs & Curieux de technologie',
    },
  ];
}
