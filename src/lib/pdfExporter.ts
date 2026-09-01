import { jsPDF } from 'jspdf';
import { Ebook } from '../types';
import { BookTrimSizeId, getTrimSize, BookTrimSize } from './bookTrimSizes';

export interface PdfExportOptions {
  authorName?: string;
  coverTheme?: 'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche';
  collectionLabel?: string;
  trimSize?: BookTrimSizeId;
  watermarkText?: string;
  imageCache?: Map<string, string>;
  ecoDraftMode?: boolean;
  includeLiminaryPages?: boolean;
}


export interface CoverPngExportOptions {
  width?: number;
  height?: number;
  authorName?: string;
  coverTheme?: 'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche';
  collectionLabel?: string;
  trimSize?: BookTrimSizeId;
  format?: 'portrait_hd' | 'square_social' | 'banner_promo';
}

interface ThemePalette {
  coverBg: [number, number, number];
  coverText: [number, number, number];
  coverAccent: [number, number, number];
  coverBorder: [number, number, number];
  coverSubtitle: [number, number, number];
  pageBg: [number, number, number];
  pageBorder: [number, number, number];
  textInk: [number, number, number];
  primaryAccent: [number, number, number];
  mutedText: [number, number, number];
  boxBg: [number, number, number];
}

const THEME_PALETTES: Record<string, ThemePalette> = {
  velin: {
    coverBg: [240, 247, 255], // #F0F7FF Bleu Céleste
    coverText: [15, 35, 70], // #0F2346
    coverAccent: [29, 78, 216], // #1D4ED8
    coverBorder: [147, 197, 253], // #93C5FD
    coverSubtitle: [51, 92, 128], // #335C80
    pageBg: [248, 251, 255],
    pageBorder: [191, 219, 254],
    textInk: [15, 25, 45],
    primaryAccent: [29, 78, 216],
    mutedText: [70, 95, 130],
    boxBg: [224, 240, 254],
  },
  carmin: {
    coverBg: [11, 25, 56], // #0B1938 Bleu Roi Profond
    coverText: [250, 247, 240], // #FAF7F0
    coverAccent: [212, 175, 55], // #D4AF37 Gold
    coverBorder: [212, 175, 55],
    coverSubtitle: [191, 219, 254], // #BFDBFE
    pageBg: [250, 252, 255],
    pageBorder: [180, 205, 240],
    textInk: [15, 25, 45],
    primaryAccent: [29, 78, 216],
    mutedText: [70, 95, 130],
    boxBg: [230, 242, 255],
  },
  nuit: {
    coverBg: [8, 14, 28], // #080E1C Bleu Nuit
    coverText: [248, 250, 252], // #F8FAFC
    coverAccent: [147, 197, 253], // #93C5FD
    coverBorder: [96, 165, 250], // #60A5FA
    coverSubtitle: [147, 197, 253],
    pageBg: [248, 250, 255],
    pageBorder: [180, 200, 235],
    textInk: [15, 23, 42],
    primaryAccent: [37, 99, 235],
    mutedText: [71, 85, 105],
    boxBg: [225, 238, 255],
  },
  emeraude: {
    coverBg: [8, 31, 56], // #081F38 Bleu Saphir
    coverText: [240, 249, 255],
    coverAccent: [245, 158, 11], // #F59E0B Cuivre
    coverBorder: [59, 130, 246], // #3B82F6
    coverSubtitle: [186, 230, 253],
    pageBg: [248, 252, 255],
    pageBorder: [180, 210, 245],
    textInk: [15, 25, 45],
    primaryAccent: [14, 116, 144],
    mutedText: [70, 95, 130],
    boxBg: [224, 242, 254],
  },
  blanche: {
    coverBg: [248, 251, 255], // #F8FBFF Azur Épuré
    coverText: [15, 23, 42],
    coverAccent: [37, 99, 235], // #2563EB
    coverBorder: [191, 219, 254], // #BFDBFE
    coverSubtitle: [59, 130, 246],
    pageBg: [255, 255, 255],
    pageBorder: [200, 220, 250],
    textInk: [15, 23, 42],
    primaryAccent: [29, 78, 216],
    mutedText: [71, 85, 105],
    boxBg: [238, 246, 255],
  },
};

/**
 * Builds the full formatted jsPDF document supporting all 14 Amazon KDP & Print Trim Sizes
 */
export function generateEbookPdf(ebook: Ebook, options?: PdfExportOptions): jsPDF {
  const trim = getTrimSize(options?.trimSize || ebook.trim_size);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [trim.widthMm, trim.heightMm],
  });

  const themeKey = options?.coverTheme || (ebook.cover_theme as any) || 'velin';
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.velin;

  const author = options?.authorName || 'Auteur du Manuscrit';
  const collection = options?.collectionLabel || ebook.contenu.metadata?.genre || "MANUSCRIT & GUIDE ÉDITORIAL";

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = trim.recommendedMarginMm;
  const contentWidth = pageWidth - margin * 2;

  const fillPageBackground = (isCover = false) => {
    const bg = isCover ? palette.coverBg : palette.pageBg;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const drawPageBorder = (isCover = false) => {
    const border = isCover ? palette.coverBorder : palette.pageBorder;
    doc.setDrawColor(border[0], border[1], border[2]);
    const outerPad = Math.max(6, margin * 0.45);
    const innerPad = outerPad + 1.8;
    doc.setLineWidth(0.35);
    doc.rect(outerPad, outerPad, pageWidth - outerPad * 2, pageHeight - outerPad * 2);
    doc.setLineWidth(0.15);
    doc.rect(innerPad, innerPad, pageWidth - innerPad * 2, pageHeight - innerPad * 2);
  };

  // --- 1. COVER PAGE ---
  fillPageBackground(true);
  drawPageBorder(true);

  // Decorative header badge / Collection
  doc.setFont('times', 'normal');
  doc.setFontSize(Math.min(9.5, pageHeight * 0.04));
  doc.setTextColor(palette.coverAccent[0], palette.coverAccent[1], palette.coverAccent[2]);
  const genreTag = collection.toUpperCase();
  const badgeY = Math.max(22, pageHeight * 0.11);
  doc.text(genreTag, pageWidth / 2, badgeY, { align: 'center' });

  // Decorative line
  doc.setDrawColor(palette.coverAccent[0], palette.coverAccent[1], palette.coverAccent[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 24, badgeY + 3, pageWidth / 2 + 24, badgeY + 3);

  // Author Name (Top of title)
  doc.setFont('times', 'bold');
  doc.setFontSize(Math.min(13, pageHeight * 0.055));
  doc.setTextColor(palette.coverAccent[0], palette.coverAccent[1], palette.coverAccent[2]);
  const authorY = badgeY + Math.max(12, pageHeight * 0.055);
  doc.text(author.toUpperCase(), pageWidth / 2, authorY, { align: 'center' });

  // Title
  const titleFontSize = Math.min(trim.titleFontSizePt, Math.round(pageWidth * 0.13));
  doc.setFont('times', 'bold');
  doc.setFontSize(titleFontSize);
  doc.setTextColor(palette.coverText[0], palette.coverText[1], palette.coverText[2]);
  const titleLines = doc.splitTextToSize(ebook.titre, contentWidth - 6);
  const startTitleY = authorY + Math.max(14, pageHeight * 0.065);
  doc.text(titleLines, pageWidth / 2, startTitleY, { align: 'center' });

  let curY = startTitleY + titleLines.length * (titleFontSize * 0.38);

  // Subtitle
  if (ebook.sous_titre) {
    const subFontSize = Math.min(12, Math.round(titleFontSize * 0.55));
    doc.setFont('times', 'italic');
    doc.setFontSize(subFontSize);
    doc.setTextColor(palette.coverSubtitle[0], palette.coverSubtitle[1], palette.coverSubtitle[2]);
    const subLines = doc.splitTextToSize(ebook.sous_titre, contentWidth - 10);
    doc.text(subLines, pageWidth / 2, curY, { align: 'center' });
    curY += subLines.length * (subFontSize * 0.42) + 8;
  } else {
    curY += 8;
  }

  // Decorative emblem separator
  doc.setDrawColor(palette.coverBorder[0], palette.coverBorder[1], palette.coverBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 30, curY, pageWidth / 2 + 30, curY);
  curY += 10;

  // Description / 4th cover summary box
  if (ebook.description && curY < pageHeight - 55) {
    const descLines = doc.splitTextToSize(ebook.description, contentWidth - 16);
    const maxAllowedLines = Math.floor((pageHeight - curY - 45) / 4.8);
    const clippedLines = descLines.slice(0, Math.max(3, maxAllowedLines));
    const boxHeight = clippedLines.length * 4.8 + 10;

    const isDarkCover = themeKey === 'carmin' || themeKey === 'nuit' || themeKey === 'emeraude';
    if (isDarkCover) {
      doc.setFillColor(0, 0, 0);
      doc.roundedRect(margin + 2, curY, contentWidth - 4, boxHeight, 2, 2, 'F');
      doc.setDrawColor(palette.coverBorder[0], palette.coverBorder[1], palette.coverBorder[2]);
      doc.roundedRect(margin + 2, curY, contentWidth - 4, boxHeight, 2, 2, 'S');

      doc.setFont('times', 'italic');
      doc.setFontSize(8.8);
      doc.setTextColor(240, 235, 225);
      doc.text(clippedLines, margin + 7, curY + 6.5);
    } else {
      doc.setFillColor(palette.boxBg[0], palette.boxBg[1], palette.boxBg[2]);
      doc.roundedRect(margin + 2, curY, contentWidth - 4, boxHeight, 2, 2, 'F');
      doc.setDrawColor(palette.coverBorder[0], palette.coverBorder[1], palette.coverBorder[2]);
      doc.roundedRect(margin + 2, curY, contentWidth - 4, boxHeight, 2, 2, 'S');

      doc.setFont('times', 'italic');
      doc.setFontSize(8.8);
      doc.setTextColor(palette.coverText[0], palette.coverText[1], palette.coverText[2]);
      doc.text(clippedLines, margin + 7, curY + 6.5);
    }
  }

  // Metadata & Format pill at bottom
  const metaText = `Format : ${trim.inches} (${trim.cm})  •  ${ebook.contenu.metadata?.pages_estimees || 15} p.`;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(palette.coverSubtitle[0], palette.coverSubtitle[1], palette.coverSubtitle[2]);
  doc.text(metaText, pageWidth / 2, pageHeight - margin - 10, { align: 'center' });

  // Publisher signature
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(palette.coverAccent[0], palette.coverAccent[1], palette.coverAccent[2]);
  doc.text("Édition Manuscrit Studio  •  Standard Amazon KDP", pageWidth / 2, pageHeight - margin - 4, { align: 'center' });

  const mentions = ebook.contenu.mentions_legales;

  // --- 1.2. PAGE DE GRAND TITRE & FAUX-TITRE ---
  doc.addPage();
  fillPageBackground(false);
  drawPageBorder(false);

  const titlePageCenterY = pageHeight * 0.32;
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
  doc.text(author.toUpperCase(), pageWidth / 2, titlePageCenterY - 24, { align: 'center' });

  doc.setDrawColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 20, titlePageCenterY - 18, pageWidth / 2 + 20, titlePageCenterY - 18);

  doc.setFont('times', 'bold');
  doc.setFontSize(Math.min(22, trim.titleFontSizePt * 0.95));
  doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
  const mainTitleLines = doc.splitTextToSize(ebook.titre, contentWidth - 10);
  doc.text(mainTitleLines, pageWidth / 2, titlePageCenterY, { align: 'center' });

  let curTitleY = titlePageCenterY + mainTitleLines.length * 7;
  if (ebook.sous_titre) {
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    const subTitleLines = doc.splitTextToSize(ebook.sous_titre, contentWidth - 16);
    doc.text(subTitleLines, pageWidth / 2, curTitleY + 4, { align: 'center' });
    curTitleY += subTitleLines.length * 5 + 6;
  }

  doc.setDrawColor(palette.pageBorder[0], palette.pageBorder[1], palette.pageBorder[2]);
  doc.line(pageWidth / 2 - 30, curTitleY + 8, pageWidth / 2 + 30, curTitleY + 8);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
  doc.text(mentions?.editeur || "Éditions Manuscrit Studio", pageWidth / 2, pageHeight - margin - 15, { align: 'center' });
  doc.text("Paris • New York • Tokyo", pageWidth / 2, pageHeight - margin - 10, { align: 'center' });

  // --- 1.3. PAGE DE MENTIONS LÉGALES & COPYRIGHT (ACHEVÉ D'IMPRIMER) ---
  doc.addPage();
  fillPageBackground(false);

  const legalY = pageHeight * 0.55;
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);

  const copyrightText = mentions?.droits_reserves || "Tous droits de traduction, de reproduction et d'adaptation réservés pour tous pays. Toute reproduction, même partielle, par quelque procédé que ce soit, est interdite sans autorisation préalable de l'auteur et de l'éditeur.";
  const legalLines = doc.splitTextToSize(copyrightText, contentWidth - 20);
  doc.text(legalLines, margin + 10, legalY);

  let legalSubY = legalY + legalLines.length * 3.6 + 6;
  doc.setFont('times', 'bold');
  doc.text(`© ${new Date().getFullYear()} ${author}. Tous droits réservés.`, margin + 10, legalSubY);
  legalSubY += 4.5;

  doc.setFont('times', 'normal');
  doc.text(`ISBN (Broché KDP) : ${mentions?.isbn || "978-2-1234-5678-9"}`, margin + 10, legalSubY);
  legalSubY += 4;
  doc.text(`Dépôt légal : ${mentions?.depot_legal || "Août 2026"}`, margin + 10, legalSubY);
  legalSubY += 4;
  doc.text(`Imprimé par Amazon Fulfillment Services • Format broché ${trim.inches}`, margin + 10, legalSubY);

  // Dédicace si présente
  if (mentions?.dedicace) {
    doc.setFont('times', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    const dedLines = doc.splitTextToSize(`« ${mentions.dedicace} »`, contentWidth - 30);
    doc.text(dedLines, pageWidth / 2, pageHeight * 0.28, { align: 'center' });
  }

  // --- 2. TABLE DES MATIÈRES (SOMMAIRE) ---
  doc.addPage();
  fillPageBackground(false);
  drawPageBorder(false);

  const tocTitleY = Math.max(26, margin * 1.8);
  doc.setFont('times', 'bold');
  doc.setFontSize(Math.min(18, trim.titleFontSizePt * 0.8));
  doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
  doc.text("Table des Matières", pageWidth / 2, tocTitleY, { align: 'center' });

  doc.setDrawColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 20, tocTitleY + 4, pageWidth / 2 + 20, tocTitleY + 4);

  let tocY = tocTitleY + 16;
  const chapters = ebook.contenu.chapitres || [];

  const checkTocOverflow = (needed: number) => {
    if (tocY + needed > pageHeight - margin - 12) {
      doc.addPage();
      fillPageBackground(false);
      drawPageBorder(false);
      doc.setFont('times', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
      doc.text(`— Sommaire (suite) —`, pageWidth / 2, Math.max(14, margin * 0.8), { align: 'center' });
      tocY = Math.max(24, margin * 1.4);
    }
  };

  if (ebook.contenu.introduction) {
    checkTocOverflow(12);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    doc.text("Introduction Préliminaire", margin + 4, tocY);
    doc.setDrawColor(210, 200, 185);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 52, tocY, pageWidth - margin - 12, tocY);
    doc.setLineDashPattern([], 0);
    doc.text("Folio I", pageWidth - margin - 8, tocY, { align: 'right' });
    tocY += 8.5;
  }

  chapters.forEach((chap) => {
    checkTocOverflow(chap.sections && chap.sections.length > 0 ? 16 : 9);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    const cleanTitle = chap.titre.replace(/^Chapitre\s*\d+\s*:\s*/i, '');
    const chapHeader = `Chapitre ${chap.numero} : ${cleanTitle}`;
    const maxChars = Math.floor(contentWidth * 0.28);
    const truncated = chapHeader.length > maxChars ? chapHeader.slice(0, maxChars - 3) + '...' : chapHeader;
    doc.text(truncated, margin + 4, tocY);
    
    doc.setDrawColor(210, 200, 185);
    doc.setLineDashPattern([1, 2], 0);
    const textWidth = doc.getTextWidth(truncated);
    if (margin + 6 + textWidth < pageWidth - margin - 14) {
      doc.line(margin + 6 + textWidth, tocY, pageWidth - margin - 12, tocY);
    }
    doc.setLineDashPattern([], 0);
    
    doc.setFont('times', 'normal');
    doc.text(`Folio 0${chap.numero}`, pageWidth - margin - 8, tocY, { align: 'right' });
    tocY += 7.5;

    // Sub-sections bullet points (condensed when many chapters)
    const maxSecToShow = chapters.length > 8 ? 2 : 3;
    if (chap.sections && chap.sections.length > 0) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8.2);
      doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
      chap.sections.slice(0, maxSecToShow).forEach((sec) => {
        checkTocOverflow(5.5);
        const secTitle = `• ${sec.titre}`;
        const secMax = Math.floor(contentWidth * 0.32);
        const secTrunc = secTitle.length > secMax ? secTitle.slice(0, secMax - 3) + '...' : secTitle;
        doc.text(secTrunc, margin + 8, tocY);
        tocY += 4.8;
      });
      tocY += 1.5;
    }
  });

  if (ebook.contenu.conclusion) {
    checkTocOverflow(10);
    tocY += 2;
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    doc.text("Conclusion & Perspectives", margin + 4, tocY);
    doc.setDrawColor(210, 200, 185);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 55, tocY, pageWidth - margin - 12, tocY);
    doc.setLineDashPattern([], 0);
    doc.text("Épilogue", pageWidth - margin - 8, tocY, { align: 'right' });
  }

  // Helper for adding new content pages with running header & footer
  const headerY = Math.max(12, margin * 0.75);
  const footerY = pageHeight - Math.max(10, margin * 0.7);
  const maxY = pageHeight - margin - 10; // Printable vertical ceiling before footer

  const drawRunningHeaderFooter = (pageDoc: jsPDF) => {
    // Running header
    pageDoc.setFont('times', 'italic');
    pageDoc.setFontSize(8);
    pageDoc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
    const headerTitle = ebook.titre.length > 40 ? ebook.titre.slice(0, 38) + '...' : ebook.titre;
    pageDoc.text(headerTitle, margin, headerY);
    pageDoc.setDrawColor(palette.pageBorder[0], palette.pageBorder[1], palette.pageBorder[2]);
    pageDoc.setLineWidth(0.2);
    pageDoc.line(margin, headerY + 2, pageWidth - margin, headerY + 2);

    // Running footer (Folio) - Always in Times font to avoid monospace leakage
    pageDoc.setFont('times', 'italic');
    pageDoc.setFontSize(8.5);
    pageDoc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
    pageDoc.text(`— Folio ${pageDoc.getNumberOfPages()} —`, pageWidth / 2, footerY, { align: 'center' });
  };

  const ensureVerticalSpace = (neededHeight: number, currentY: number): number => {
    if (currentY + neededHeight > maxY) {
      doc.addPage();
      fillPageBackground(false);
      drawPageBorder(false);
      drawRunningHeaderFooter(doc);
      // Restore default body font
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
      return headerY + 10;
    }
    return currentY;
  };

  /**
   * Renders long body paragraphs flowing naturally across page boundaries line-by-line.
   * Eliminates huge empty bottom spaces and prevents overflow.
   */
  const renderFlowingParagraph = (text: string, currentY: number, fontSize = 10, lineHeight = 4.6): number => {
    if (!text || !text.trim()) return currentY;

    doc.setFont('times', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);

    const lines = doc.splitTextToSize(text.trim(), contentWidth);
    let y = currentY;

    // Check if we have room for at least 2 lines on current page (orphan protection)
    if (y + lineHeight * 2 > maxY) {
      doc.addPage();
      fillPageBackground(false);
      drawPageBorder(false);
      drawRunningHeaderFooter(doc);
      doc.setFont('times', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
      y = headerY + 10;
    }

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > maxY) {
        doc.addPage();
        fillPageBackground(false);
        drawPageBorder(false);
        drawRunningHeaderFooter(doc);
        doc.setFont('times', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
        y = headerY + 10;
      }

      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    return y + 3.2; // Spacing after paragraph
  };

  // --- 3. INTRODUCTION PAGE ---
  if (ebook.contenu.introduction) {
    doc.addPage();
    fillPageBackground(false);
    drawPageBorder(false);

    // Running footer
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
    doc.text(`— Folio ${doc.getNumberOfPages()} —`, pageWidth / 2, footerY, { align: 'center' });

    let intY = 30;
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
    doc.text("Introduction", margin, intY);
    intY += 4;
    doc.setDrawColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, intY, margin + 30, intY);
    intY += 8;

    const paragraphs = ebook.contenu.introduction.split('\n\n');
    paragraphs.forEach((p) => {
      if (!p.trim()) return;
      intY = renderFlowingParagraph(p.trim(), intY, 10, 4.6);
    });
  }

  // --- 4. CHAPTERS ---
  chapters.forEach((chap) => {
    doc.addPage();
    fillPageBackground(false);
    drawPageBorder(false);

    // Footer
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
    doc.text(`— Folio ${doc.getNumberOfPages()} —`, pageWidth / 2, footerY, { align: 'center' });

    let chY = 28;

    // Chapter Top Label (Centered)
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
    doc.text(`CHAPITRE ${chap.numero}`, pageWidth / 2, chY, { align: 'center' });
    chY += 6;

    // Chapter Main Title (Centered)
    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
    const cleanTitle = chap.titre.replace(/^Chapitre\s*\d+\s*:\s*/i, '');
    const titleLines = doc.splitTextToSize(cleanTitle, contentWidth - 12);
    doc.text(titleLines, pageWidth / 2, chY, { align: 'center' });
    chY += titleLines.length * 6 + 2;

    // Separator line (Centered)
    doc.setDrawColor(palette.pageBorder[0], palette.pageBorder[1], palette.pageBorder[2]);
    doc.setLineWidth(0.4);
    const sepHalfWidth = Math.min(30, contentWidth * 0.28);
    doc.line(pageWidth / 2 - sepHalfWidth, chY, pageWidth / 2 + sepHalfWidth, chY);
    chY += 6;

    // Sections
    chap.sections.forEach((sec) => {
      // Ensure vertical space for section title + at least 2 lines of text (prevent orphan headings)
      chY = ensureVerticalSpace(18, chY);

      // Section Title
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
      doc.text(sec.titre, margin, chY);
      chY += 4.8;

      if (sec.sous_titre) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
        doc.text(sec.sous_titre, margin, chY);
        chY += 4.5;
      }

      chY += 1.5;

      // Paragraphs & Inline Images Sequence
      sec.paragraphes.forEach((p) => {
        const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
        let lastIdx = 0;
        let match: RegExpExecArray | null;
        const subBlocks: Array<{ type: 'text' | 'image'; text?: string; url?: string; caption?: string }> = [];

        while ((match = imageRegex.exec(p)) !== null) {
          if (match.index > lastIdx) {
            subBlocks.push({ type: 'text', text: p.substring(lastIdx, match.index) });
          }
          subBlocks.push({
            type: 'image',
            caption: match[1] || undefined,
            url: match[2],
          });
          lastIdx = imageRegex.lastIndex;
        }
        if (lastIdx < p.length) {
          subBlocks.push({ type: 'text', text: p.substring(lastIdx) });
        }

        if (subBlocks.length === 0) {
          subBlocks.push({ type: 'text', text: p });
        }

        subBlocks.forEach((block) => {
          if (block.type === 'text' && block.text && block.text.trim()) {
            chY = renderFlowingParagraph(block.text.trim(), chY, 10, 4.6);
          } else if (block.type === 'image' && block.url) {
            const cachedData = options?.imageCache?.get(block.url) || block.url;
            const imgMaxW = Math.min(contentWidth - 10, 110);
            const imgMaxH = 55;
            const needed = imgMaxH + (block.caption ? 12 : 6);

            chY = ensureVerticalSpace(needed, chY);

            try {
              const imgX = margin + (contentWidth - imgMaxW) / 2;
              
              doc.setFillColor(palette.boxBg[0], palette.boxBg[1], palette.boxBg[2]);
              doc.roundedRect(imgX - 2, chY - 2, imgMaxW + 4, imgMaxH + 4, 1.5, 1.5, 'F');
              doc.setDrawColor(palette.pageBorder[0], palette.pageBorder[1], palette.pageBorder[2]);
              doc.setLineWidth(0.2);
              doc.roundedRect(imgX - 2, chY - 2, imgMaxW + 4, imgMaxH + 4, 1.5, 1.5, 'D');

              doc.addImage(cachedData, 'JPEG', imgX, chY, imgMaxW, imgMaxH);
              chY += imgMaxH + 3;

              if (block.caption) {
                doc.setFont('times', 'italic');
                doc.setFontSize(8.5);
                doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
                const captionLines = doc.splitTextToSize(block.caption, contentWidth - 20);
                doc.text(captionLines, pageWidth / 2, chY, { align: 'center' });
                chY += captionLines.length * 3.6 + 2;
              } else {
                chY += 2;
              }
            } catch (imgErr) {
              console.warn("Impossible d'incorporer l'image dans le PDF:", imgErr);
              doc.setFont('times', 'italic');
              doc.setFontSize(8.5);
              doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
              doc.text(`[Illustration : ${block.caption || 'Image insérée'}]`, margin, chY);
              chY += 5;
            }
          }
        });
      });

      // Footnotes (Notes de bas de page) for this section
      if (sec.notes_de_bas_de_page && sec.notes_de_bas_de_page.length > 0) {
        chY = ensureVerticalSpace(14, chY);
        doc.setDrawColor(palette.pageBorder[0], palette.pageBorder[1], palette.pageBorder[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, chY, margin + 35, chY);
        chY += 3.5;

        sec.notes_de_bas_de_page.forEach((fn) => {
          doc.setFont('times', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
          const fnText = `[${fn.reference_number}] ${fn.terme_cible ? `« ${fn.terme_cible} » : ` : ''}${fn.contenu}`;
          const fnLines = doc.splitTextToSize(fnText, contentWidth - 4);
          chY = ensureVerticalSpace(fnLines.length * 3.5 + 2, chY);
          doc.setFont('times', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
          doc.text(fnLines, margin + 2, chY);
          chY += fnLines.length * 3.5 + 1.5;
        });
        chY += 3;
      }

      chY += 3;
    });

    // Chapter Conclusion
    if (chap.conclusion_chapitre) {
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      const concLines = doc.splitTextToSize(chap.conclusion_chapitre, contentWidth - 12);
      const concHeight = concLines.length * 4.6 + 9;
      chY = ensureVerticalSpace(concHeight + 5, chY);

      doc.setFillColor(palette.boxBg[0], palette.boxBg[1], palette.boxBg[2]);
      doc.roundedRect(margin, chY, contentWidth, concHeight, 2, 2, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
      doc.text("SYNTHÈSE DU CHAPITRE", margin + 6, chY + 4.5);

      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(palette.textInk[0], palette.textInk[1], palette.textInk[2]);
      doc.text(concLines, margin + 6, chY + 9.5);
      chY += concHeight + 6;
    }
  });

  // --- 5. CONCLUSION ---
  if (ebook.contenu.conclusion) {
    doc.addPage();
    fillPageBackground(false);
    drawPageBorder(false);

    // Footer
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.mutedText[0], palette.mutedText[1], palette.mutedText[2]);
    doc.text(`— Folio ${doc.getNumberOfPages()} —`, pageWidth / 2, footerY, { align: 'center' });

    let conY = 30;
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
    doc.text("Conclusion & Perspectives", margin, conY);
    conY += 4;
    doc.setDrawColor(palette.primaryAccent[0], palette.primaryAccent[1], palette.primaryAccent[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, conY, margin + 40, conY);
    conY += 8;

    const paragraphs = ebook.contenu.conclusion.split('\n\n');
    paragraphs.forEach((p) => {
      if (!p.trim()) return;
      conY = renderFlowingParagraph(p.trim(), conY, 10, 4.6);
    });
  }

  return doc;
}

/**
 * Preloads all inline images found in an eBook and converts them to Data URLs
 * for guaranteed reliable rendering in jsPDF across all environments.
 */
export async function preloadEbookImages(ebook: Ebook): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
  const urls: string[] = [];

  ebook.contenu.chapitres.forEach((chap) => {
    chap.sections.forEach((sec) => {
      sec.paragraphes.forEach((p) => {
        let match: RegExpExecArray | null;
        while ((match = imageRegex.exec(p)) !== null) {
          if (match[2] && !urls.includes(match[2])) {
            urls.push(match[2]);
          }
        }
      });
    });
  });

  await Promise.all(
    urls.map(async (url) => {
      try {
        if (url.startsWith('data:image/')) {
          imageMap.set(url, url);
          return;
        }
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              imageMap.set(url, reader.result);
            }
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn(`Impossible de précharger l'image ${url}:`, err);
      }
    })
  );

  return imageMap;
}

/**
 * Directly downloads the styled PDF in browser with preloaded inline images
 */
export async function exportEbookToPdfAsync(ebook: Ebook, options?: PdfExportOptions): Promise<void> {
  const imageCache = await preloadEbookImages(ebook);
  const doc = generateEbookPdf(ebook, { ...options, imageCache });
  const sanitizedTitle = ebook.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${sanitizedTitle}_manuscrit.pdf`);
}

/**
 * Directly downloads the styled PDF in browser
 */
export function exportEbookToPdf(ebook: Ebook, options?: PdfExportOptions): void {
  const doc = generateEbookPdf(ebook, options);
  const sanitizedTitle = ebook.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${sanitizedTitle}_manuscrit.pdf`);
}

/**
 * Returns PDF as a browser Blob (for iframe live preview or upload)
 */
export function generatePdfBlob(ebook: Ebook, options?: PdfExportOptions): Blob {
  const doc = generateEbookPdf(ebook, options);
  return doc.output('blob');
}

/**
 * Returns PDF as base64 string
 */
export function generatePdfBase64(ebook: Ebook, options?: PdfExportOptions): string {
  const doc = generateEbookPdf(ebook, options);
  return doc.output('datauristring');
}

/**
 * High-resolution canvas rendering for Book Cover PNG export (Marketing, Amazon KDP, Social)
 */
export function exportCoverToPng(ebook: Ebook, options?: CoverPngExportOptions): Promise<{ dataUrl: string; download: () => void }> {
  return new Promise((resolve) => {
    const format = options?.format || 'portrait_hd';
    const trim = getTrimSize(options?.trimSize || ebook.trim_size);
    let width = 1200;
    let height = Math.round(1200 / trim.aspectRatio);

    if (format === 'square_social') {
      width = 1080;
      height = 1080;
    } else if (format === 'banner_promo') {
      width = 1200;
      height = 630;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Impossible d\'initialiser le contexte Canvas 2D');
    }

    const themeKey = options?.coverTheme || (ebook.cover_theme as any) || 'velin';
    const author = options?.authorName || 'Auteur du Manuscrit';
    const collection = options?.collectionLabel || ebook.contenu.metadata?.genre || "MANUSCRIT & GUIDE ÉDITORIAL";

    // Theme color settings for canvas
    const themeStyles: Record<string, { bg: string; text: string; accent: string; sub: string; border: string; dark: boolean }> = {
      velin: {
        bg: '#F0F7FF',
        text: '#0F2346',
        accent: '#1D4ED8',
        sub: '#335C80',
        border: '#93C5FD',
        dark: false,
      },
      carmin: {
        bg: '#0B1938',
        text: '#FAF7F0',
        accent: '#60A5FA',
        sub: '#BFDBFE',
        border: '#93C5FD',
        dark: true,
      },
      nuit: {
        bg: '#080E1C',
        text: '#F8FAFC',
        accent: '#93C5FD',
        sub: '#93C5FD',
        border: '#60A5FA',
        dark: true,
      },
      emeraude: {
        bg: '#081F38',
        text: '#F0F9FF',
        accent: '#38BDF8',
        sub: '#BAE6FD',
        border: '#3B82F6',
        dark: true,
      },
      blanche: {
        bg: '#F8FBFF',
        text: '#0F172A',
        accent: '#2563EB',
        sub: '#3B82F6',
        border: '#BFDBFE',
        dark: false,
      },
    };

    const curTheme = themeStyles[themeKey] || themeStyles.velin;

    // 1. Fill Background
    ctx.fillStyle = curTheme.bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative texture / vignette
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
    if (curTheme.dark) {
      grad.addColorStop(0, 'rgba(255,255,255,0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    } else {
      grad.addColorStop(0, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0.06)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Decorative Borders
    const pad = Math.round(width * 0.05);
    ctx.strokeStyle = curTheme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad + 8, pad + 8, width - (pad + 8) * 2, height - (pad + 8) * 2);

    // Corner Ornaments
    const cornerSize = 24;
    const corners = [
      { x: pad + 16, y: pad + 16 },
      { x: width - pad - 16, y: pad + 16 },
      { x: pad + 16, y: height - pad - 16 },
      { x: width - pad - 16, y: height - pad - 16 },
    ];
    ctx.fillStyle = curTheme.accent;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Collection Badge Top
    ctx.fillStyle = curTheme.accent;
    ctx.font = `600 ${Math.round(width * 0.024)}px 'Cinzel', 'Playfair Display', serif`;
    ctx.textAlign = 'center';
    ctx.fillText(collection.toUpperCase(), width / 2, Math.round(height * 0.12));

    // Accent line under collection
    ctx.strokeStyle = curTheme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, Math.round(height * 0.135));
    ctx.lineTo(width / 2 + 80, Math.round(height * 0.135));
    ctx.stroke();

    // 4. Author Name
    ctx.fillStyle = curTheme.accent;
    ctx.font = `700 ${Math.round(width * 0.038)}px 'Playfair Display', 'Times New Roman', serif`;
    ctx.fillText(author.toUpperCase(), width / 2, Math.round(height * 0.22));

    // 5. Main Title (Multi-line wrapping)
    ctx.fillStyle = curTheme.text;
    const titleFontSize = Math.round(width * 0.065);
    ctx.font = `bold ${titleFontSize}px 'Playfair Display', 'Cinzel', serif`;
    
    const words = ebook.titre.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxTextWidth = width * 0.76;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let startTitleY = Math.round(height * 0.32);
    lines.forEach((line) => {
      ctx.fillText(line, width / 2, startTitleY);
      startTitleY += titleFontSize * 1.25;
    });

    // 6. Subtitle
    if (ebook.sous_titre) {
      ctx.fillStyle = curTheme.sub;
      const subFontSize = Math.round(width * 0.032);
      ctx.font = `italic ${subFontSize}px 'Cinzel Decorative', 'Times New Roman', serif`;

      const subWords = ebook.sous_titre.split(' ');
      const subLines: string[] = [];
      let curSub = '';
      for (let i = 0; i < subWords.length; i++) {
        const testSub = curSub ? `${curSub} ${subWords[i]}` : subWords[i];
        if (ctx.measureText(testSub).width > width * 0.72 && curSub) {
          subLines.push(curSub);
          curSub = subWords[i];
        } else {
          curSub = testSub;
        }
      }
      if (curSub) subLines.push(curSub);

      startTitleY += 10;
      subLines.forEach((sLine) => {
        ctx.fillText(sLine, width / 2, startTitleY);
        startTitleY += subFontSize * 1.35;
      });
    }

    // 7. Central Emblem / Icon in Canvas
    const emblemY = Math.round(height * 0.62);
    ctx.strokeStyle = curTheme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2, emblemY, Math.round(width * 0.08), 0, Math.PI * 2);
    ctx.stroke();

    // 8. Footer Edition Signature
    ctx.fillStyle = curTheme.accent;
    ctx.font = `italic ${Math.round(width * 0.025)}px 'Cinzel', serif`;
    ctx.fillText("ÉDITION SILEYABOOK", width / 2, height - Math.round(height * 0.08));

    ctx.fillStyle = curTheme.sub;
    ctx.font = `${Math.round(width * 0.02)}px 'Courier New', monospace`;
    ctx.fillText("COLLECTION LITTÉRAIRE", width / 2, height - Math.round(height * 0.05));

    const dataUrl = canvas.toDataURL('image/png');
    const sanitized = (ebook.titre || 'couverture').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const download = () => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${sanitized}_couverture_${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    resolve({ dataUrl, download });
  });
}

/**
 * Calcule avec exactitude le nombre réel de pages PDF générées par jsPDF
 */
export function getEbookPdfPageCount(ebook: Ebook, options?: PdfExportOptions): number {
  try {
    const doc = generateEbookPdf(ebook, options);
    return doc.getNumberOfPages();
  } catch (err) {
    console.warn("Erreur calcul page count:", err);
    return ebook.contenu?.metadata?.pages_estimees || 15;
  }
}
