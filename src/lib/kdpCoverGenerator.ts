import { jsPDF } from 'jspdf';
import { Ebook } from '../types';
import { 
  BookTrimSizeId, 
  getTrimSize, 
  calculateKdpCoverDimensions, 
  KdpCoverDimensions 
} from './bookTrimSizes';

export interface KdpFullCoverOptions {
  authorName?: string;
  coverTheme?: 'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche';
  collectionLabel?: string;
  trimSize?: BookTrimSizeId;
  pageCount?: number;
  paperType?: 'white' | 'cream' | 'color';
  includeCropMarks?: boolean;
  includeBarcode?: boolean;
  isbn?: string;
  authorBio?: string;
  publisherName?: string;
  retailPrice?: string;
}

const THEME_PALETTES = {
  velin: {
    bg: [250, 247, 240], // #FAF7F0
    spineBg: [242, 237, 226],
    text: [42, 36, 28], // #2A241C
    accent: [140, 110, 60],
    sub: [90, 78, 61],
    border: [205, 185, 145],
    cardBg: [255, 255, 255],
    isDark: false,
  },
  carmin: {
    bg: [27, 42, 74], // #1B2A4A
    spineBg: [20, 32, 58],
    text: [250, 247, 240],
    accent: [96, 165, 250], // #60A5FA
    sub: [191, 219, 254],
    border: [46, 67, 116],
    cardBg: [14, 28, 48],
    isDark: true,
  },
  nuit: {
    bg: [11, 21, 36], // #0B1524
    spineBg: [8, 14, 26],
    text: [248, 250, 252],
    accent: [147, 197, 253],
    sub: [147, 197, 253],
    border: [46, 67, 116],
    cardBg: [15, 29, 50],
    isDark: true,
  },
  emeraude: {
    bg: [10, 36, 30],
    spineBg: [7, 26, 22],
    text: [245, 250, 247],
    accent: [52, 211, 153],
    sub: [167, 243, 208],
    border: [20, 80, 65],
    cardBg: [12, 45, 38],
    isDark: true,
  },
  blanche: {
    bg: [255, 255, 255],
    spineBg: [245, 247, 250],
    text: [15, 23, 42],
    accent: [37, 99, 235],
    sub: [71, 85, 105],
    border: [203, 213, 225],
    cardBg: [248, 250, 252],
    isDark: false,
  },
};

/**
 * Generates a print-ready KDP Full-Wrap Cover PDF (Back Cover + Spine + Front Cover + Bleed)
 */
export function generateKdpFullCoverPdf(ebook: Ebook, options?: KdpFullCoverOptions): jsPDF {
  const pages = options?.pageCount || ebook.contenu.metadata?.pages_estimees || 48;
  const paper = options?.paperType || 'white';
  const trimId = options?.trimSize || ebook.trim_size || '6x9';
  const dimensions = calculateKdpCoverDimensions(trimId, pages, paper);

  const themeKey = options?.coverTheme || (ebook.cover_theme as any) || 'velin';
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.velin;
  const author = options?.authorName || 'Auteur du Manuscrit';
  const publisher = options?.publisherName || 'Édition Manuscrit Studio';
  const isbn = options?.isbn || '978-2-1234-5678-9';
  const price = options?.retailPrice || '14,90 €';
  const collection = options?.collectionLabel || ebook.contenu.metadata?.genre || 'COLLECTION ESSAIS & SAVOIRS';

  // Create jsPDF in exact total wrap dimensions (mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [dimensions.totalWidthMm, dimensions.totalHeightMm],
  });

  const {
    bleedMm,
    totalWidthMm,
    totalHeightMm,
    frontWidthMm,
    backWidthMm,
    spineWidthMm,
    foldLineLeftMm,
    foldLineRightMm,
  } = dimensions;

  // 1. Base Background Color
  doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
  doc.rect(0, 0, totalWidthMm, totalHeightMm, 'F');

  // 2. Spine Background (Slightly tinted for depth)
  doc.setFillColor(palette.spineBg[0], palette.spineBg[1], palette.spineBg[2]);
  doc.rect(foldLineLeftMm, 0, spineWidthMm, totalHeightMm, 'F');

  // Subtle Spine borders
  doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
  doc.setLineWidth(0.25);
  doc.line(foldLineLeftMm, 0, foldLineLeftMm, totalHeightMm);
  doc.line(foldLineRightMm, 0, foldLineRightMm, totalHeightMm);

  // -------------------------------------------------------------
  // 3. FRONT COVER (PLAT RECTO) — Right section: [foldLineRightMm to totalWidthMm - bleedMm]
  // -------------------------------------------------------------
  const frontCenterX = foldLineRightMm + frontWidthMm / 2;
  const frontMarginX = foldLineRightMm + 12;
  const frontContentW = frontWidthMm - 24;

  // Front Double Border Frame
  doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
  doc.setLineWidth(0.4);
  doc.rect(foldLineRightMm + 6, bleedMm + 6, frontWidthMm - 12, totalHeightMm - bleedMm * 2 - 12);
  doc.setLineWidth(0.15);
  doc.rect(foldLineRightMm + 7.5, bleedMm + 7.5, frontWidthMm - 15, totalHeightMm - bleedMm * 2 - 15);

  // Front Collection Tag
  const frontBadgeY = bleedMm + Math.max(16, totalHeightMm * 0.1);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(collection.toUpperCase(), frontCenterX, frontBadgeY, { align: 'center' });

  doc.setDrawColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.setLineWidth(0.3);
  doc.line(frontCenterX - 20, frontBadgeY + 2.5, frontCenterX + 20, frontBadgeY + 2.5);

  // Front Author Name
  const frontAuthorY = frontBadgeY + 12;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(author.toUpperCase(), frontCenterX, frontAuthorY, { align: 'center' });

  // Front Title
  const titleFontSize = Math.min(21, Math.round(frontWidthMm * 0.12));
  doc.setFont('times', 'bold');
  doc.setFontSize(titleFontSize);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  const titleLines = doc.splitTextToSize(ebook.titre, frontContentW);
  const frontTitleY = frontAuthorY + 16;
  doc.text(titleLines, frontCenterX, frontTitleY, { align: 'center' });

  let frontCurY = frontTitleY + titleLines.length * (titleFontSize * 0.38);

  // Front Subtitle
  if (ebook.sous_titre) {
    const subFontSize = Math.min(10.5, Math.round(titleFontSize * 0.52));
    doc.setFont('times', 'italic');
    doc.setFontSize(subFontSize);
    doc.setTextColor(palette.sub[0], palette.sub[1], palette.sub[2]);
    const subLines = doc.splitTextToSize(ebook.sous_titre, frontContentW - 8);
    doc.text(subLines, frontCenterX, frontCurY + 3, { align: 'center' });
    frontCurY += subLines.length * (subFontSize * 0.45) + 6;
  } else {
    frontCurY += 6;
  }

  // Front Decorative emblem
  doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
  doc.setLineWidth(0.3);
  doc.line(frontCenterX - 25, frontCurY + 4, frontCenterX + 25, frontCurY + 4);

  // Front Publisher at bottom
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(publisher, frontCenterX, totalHeightMm - bleedMm - 14, { align: 'center' });

  // -------------------------------------------------------------
  // 4. SPINE (TRANCHE / DOS) — Middle section: [foldLineLeftMm to foldLineRightMm]
  // -------------------------------------------------------------
  const spineCenterX = foldLineLeftMm + spineWidthMm / 2;

  if (dimensions.isSpineTextEligible) {
    // Rotated vertical title & author on spine
    doc.saveGraphicsState();
    const spineFontSize = Math.min(9, Math.max(6.5, spineWidthMm * 0.7));
    doc.setFont('times', 'bold');
    doc.setFontSize(spineFontSize);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);

    // Spine text is printed top-to-bottom or rotated 90 degrees
    // We position at mid-height and rotate
    const spineText = `${ebook.titre.toUpperCase()}   —   ${author.toUpperCase()}`;
    const truncatedSpine = spineText.length > 50 ? spineText.slice(0, 47) + '...' : spineText;
    
    // Vertical text rotation: (x, y, angle 90 or -90)
    // jsPDF text rotation option: { angle: 90 }
    doc.text(truncatedSpine, spineCenterX + spineFontSize * 0.15, totalHeightMm * 0.25, {
      angle: -90,
      align: 'left',
    });

    // Publisher logo/initial at bottom of spine
    doc.setFont('times', 'bold');
    doc.setFontSize(Math.min(7, spineWidthMm * 0.8));
    doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
    doc.text("MS", spineCenterX, totalHeightMm - bleedMm - 10, { align: 'center' });

    doc.restoreGraphicsState();
  }

  // -------------------------------------------------------------
  // 5. BACK COVER (PLAT VERSO / 4ÈME DE COUV) — Left section: [bleedMm to foldLineLeftMm]
  // -------------------------------------------------------------
  const backCenterX = bleedMm + backWidthMm / 2;
  const backMarginX = bleedMm + 14;
  const backContentW = backWidthMm - 28;

  // Back Frame
  doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(bleedMm + 8, bleedMm + 8, backWidthMm - 16, totalHeightMm - bleedMm * 2 - 16);

  // Back Header / Hook
  let backCurY = bleedMm + Math.max(16, totalHeightMm * 0.1);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(ebook.titre.toUpperCase(), backCenterX, backCurY, { align: 'center' });
  backCurY += 6;

  if (ebook.sous_titre) {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(palette.sub[0], palette.sub[1], palette.sub[2]);
    doc.text(ebook.sous_titre, backCenterX, backCurY, { align: 'center' });
    backCurY += 8;
  } else {
    backCurY += 4;
  }

  // Synopsis / Book Blurb Box
  const blurbText = ebook.description || "Un ouvrage de référence soigneusement composé, enrichi de chapitres structurés, notes explicatives et synthèses éditoriales.";
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  const blurbLines = doc.splitTextToSize(blurbText, backContentW);
  doc.text(blurbLines, backMarginX, backCurY);
  backCurY += blurbLines.length * 4.2 + 8;

  // Key takeaways bullet points (from ebook content if available)
  const chapters = ebook.contenu.chapitres || [];
  if (chapters.length > 0 && backCurY < totalHeightMm - 70) {
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
    doc.text("Au sommaire de cet ouvrage :", backMarginX, backCurY);
    backCurY += 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(palette.sub[0], palette.sub[1], palette.sub[2]);
    chapters.slice(0, 3).forEach((chap) => {
      const line = `• ${chap.titre}`;
      const truncLine = line.length > 45 ? line.slice(0, 42) + '...' : line;
      doc.text(truncLine, backMarginX + 3, backCurY);
      backCurY += 4.5;
    });
    backCurY += 4;
  }

  // Author short bio
  const bio = options?.authorBio || `À propos de l’auteur : Expert et créateur reconnu, ${author} partage ses méthodes et réflexions dans une collection d'ouvrages exigeants.`;
  if (backCurY < totalHeightMm - 55) {
    doc.setFont('times', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(palette.sub[0], palette.sub[1], palette.sub[2]);
    const bioLines = doc.splitTextToSize(bio, backContentW);
    doc.text(bioLines.slice(0, 3), backMarginX, backCurY);
  }

  // -------------------------------------------------------------
  // 6. BARCODE & ISBN BOX (BOTTOM RIGHT OF BACK COVER)
  // -------------------------------------------------------------
  const { barcodeLocation } = dimensions;
  
  // White box for ISBN / EAN barcode
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(barcodeLocation.xMm, barcodeLocation.yMm, barcodeLocation.widthMm, barcodeLocation.heightMm, 1, 1, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.roundedRect(barcodeLocation.xMm, barcodeLocation.yMm, barcodeLocation.widthMm, barcodeLocation.heightMm, 1, 1, 'S');

  // Simulated EAN-13 Barcode Vector Lines
  doc.setFillColor(0, 0, 0);
  const barStartXMm = barcodeLocation.xMm + 4;
  const barStartYMm = barcodeLocation.yMm + 3;
  const barHeightMm = barcodeLocation.heightMm - 10;
  const barCount = 38;
  const barSpacing = (barcodeLocation.widthMm - 8) / barCount;

  // Simple pseudo-barcode pattern for realistic rendering
  const pattern = [1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,1,0,1,0,1];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === 1) {
      doc.rect(barStartXMm + i * barSpacing, barStartYMm, barSpacing * 0.75, barHeightMm, 'F');
    }
  }

  // ISBN Text below barcode
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`ISBN ${isbn}`, barcodeLocation.xMm + barcodeLocation.widthMm / 2, barcodeLocation.yMm + barcodeLocation.heightMm - 2.5, { align: 'center' });

  // Price & Publisher Category (Left of Barcode)
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(`Prix : ${price}`, barcodeLocation.xMm - 6, barcodeLocation.yMm + 10, { align: 'right' });

  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(palette.sub[0], palette.sub[1], palette.sub[2]);
  doc.text("Édition Broché KDP", barcodeLocation.xMm - 6, barcodeLocation.yMm + 15, { align: 'right' });
  doc.text("Imprimé par Amazon", barcodeLocation.xMm - 6, barcodeLocation.yMm + 19, { align: 'right' });

  // -------------------------------------------------------------
  // 7. PRINTER CROP MARKS & FOLD GUIDES (IF ENABLED)
  // -------------------------------------------------------------
  if (options?.includeCropMarks) {
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.15);

    // Spine Fold Guides (Dashed line on spine boundaries)
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(foldLineLeftMm, 0, foldLineLeftMm, totalHeightMm);
    doc.line(foldLineRightMm, 0, foldLineRightMm, totalHeightMm);
    doc.setLineDashPattern([], 0);

    // Bleed Crop Marks at 4 outer corners
    const markLength = 4;
    // Top-Left
    doc.line(bleedMm, 0, bleedMm, markLength);
    doc.line(0, bleedMm, markLength, bleedMm);
    // Top-Right
    doc.line(totalWidthMm - bleedMm, 0, totalWidthMm - bleedMm, markLength);
    doc.line(totalWidthMm, bleedMm, totalWidthMm - markLength, bleedMm);
    // Bottom-Left
    doc.line(bleedMm, totalHeightMm, bleedMm, totalHeightMm - markLength);
    doc.line(0, totalHeightMm - bleedMm, markLength, totalHeightMm - bleedMm);
    // Bottom-Right
    doc.line(totalWidthMm - bleedMm, totalHeightMm, totalWidthMm - bleedMm, totalHeightMm - markLength);
    doc.line(totalWidthMm, totalHeightMm - bleedMm, totalWidthMm - markLength, totalHeightMm - bleedMm);
  }

  return doc;
}

/**
 * Generates and downloads the full wrap cover PDF
 */
export function exportKdpFullCoverPdf(ebook: Ebook, options?: KdpFullCoverOptions): void {
  const doc = generateKdpFullCoverPdf(ebook, options);
  const trim = getTrimSize(options?.trimSize || ebook.trim_size);
  const sanitized = (ebook.titre || 'Livre').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  doc.save(`${sanitized}_Gabarit_Couverture_Complete_KDP_${trim.inches.replace(/[^a-zA-Z0-9]/g, '')}.pdf`);
}

/**
 * Generates a full wrap high-resolution PNG using HTML Canvas
 */
export function renderKdpFullCoverToCanvas(
  canvas: HTMLCanvasElement,
  ebook: Ebook,
  options?: KdpFullCoverOptions & { showGuides?: boolean }
): void {
  const pages = options?.pageCount || ebook.contenu.metadata?.pages_estimees || 48;
  const paper = options?.paperType || 'white';
  const trimId = options?.trimSize || ebook.trim_size || '6x9';
  const dimensions = calculateKdpCoverDimensions(trimId, pages, paper);

  const themeKey = options?.coverTheme || (ebook.cover_theme as any) || 'velin';
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.velin;
  const author = options?.authorName || 'Auteur du Manuscrit';
  const publisher = options?.publisherName || 'Édition Manuscrit Studio';
  const isbn = options?.isbn || '978-2-1234-5678-9';
  const price = options?.retailPrice || '14,90 €';
  const showGuides = options?.showGuides ?? false;

  const scale = 2; // Render scale for crisp display
  const width = Math.round((dimensions.totalWidthMm * 300) / 25.4 / (scale * 2));
  const height = Math.round((dimensions.totalHeightMm * 300) / 25.4 / (scale * 2));

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const mmToPx = (mm: number) => (mm / dimensions.totalWidthMm) * width;
  const mmToPy = (mm: number) => (mm / dimensions.totalHeightMm) * height;

  const rgb = (arr: number[]) => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;

  // Background
  ctx.fillStyle = rgb(palette.bg);
  ctx.fillRect(0, 0, width, height);

  // Spine
  const spineX = mmToPx(dimensions.foldLineLeftMm);
  const spineW = mmToPx(dimensions.spineWidthMm);
  ctx.fillStyle = rgb(palette.spineBg);
  ctx.fillRect(spineX, 0, spineW, height);

  // Spine Borders
  ctx.strokeStyle = rgb(palette.border);
  ctx.lineWidth = 1;
  ctx.strokeRect(spineX, 0, spineW, height);

  // Front Frame
  const frontStartX = mmToPx(dimensions.foldLineRightMm);
  const frontW = mmToPx(dimensions.frontWidthMm);
  ctx.strokeStyle = rgb(palette.border);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frontStartX + mmToPx(6), mmToPy(dimensions.bleedMm + 6), frontW - mmToPx(12), height - mmToPy(dimensions.bleedMm * 2 + 12));

  // Front Content
  const frontCenterX = frontStartX + frontW / 2;
  ctx.fillStyle = rgb(palette.text);
  ctx.textAlign = 'center';

  // Front Author
  ctx.fillStyle = rgb(palette.accent);
  ctx.font = `bold ${Math.round(height * 0.038)}px serif`;
  ctx.fillText(author.toUpperCase(), frontCenterX, height * 0.22);

  // Front Title
  ctx.fillStyle = rgb(palette.text);
  ctx.font = `bold ${Math.round(height * 0.055)}px serif`;
  ctx.fillText(ebook.titre.slice(0, 24), frontCenterX, height * 0.34);
  if (ebook.titre.length > 24) {
    ctx.fillText(ebook.titre.slice(24, 48), frontCenterX, height * 0.40);
  }

  // Front Subtitle
  if (ebook.sous_titre) {
    ctx.fillStyle = rgb(palette.sub);
    ctx.font = `italic ${Math.round(height * 0.026)}px serif`;
    ctx.fillText(ebook.sous_titre.slice(0, 40), frontCenterX, height * 0.48);
  }

  // Front Publisher
  ctx.fillStyle = rgb(palette.accent);
  ctx.font = `italic ${Math.round(height * 0.022)}px serif`;
  ctx.fillText(publisher, frontCenterX, height * 0.92);

  // Back Content
  const backW = mmToPx(dimensions.backWidthMm);
  const backCenterX = mmToPx(dimensions.bleedMm) + backW / 2;

  // Back Frame
  ctx.strokeStyle = rgb(palette.border);
  ctx.lineWidth = 1;
  ctx.strokeRect(mmToPx(dimensions.bleedMm + 8), mmToPy(dimensions.bleedMm + 8), backW - mmToPx(16), height - mmToPy(dimensions.bleedMm * 2 + 16));

  // Back Title & Synopsis
  ctx.fillStyle = rgb(palette.accent);
  ctx.font = `bold ${Math.round(height * 0.032)}px serif`;
  ctx.fillText(ebook.titre.toUpperCase().slice(0, 30), backCenterX, height * 0.20);

  ctx.fillStyle = rgb(palette.text);
  ctx.font = `${Math.round(height * 0.022)}px serif`;
  ctx.textAlign = 'left';
  const descText = ebook.description || "Un ouvrage de référence soigneusement composé pour Amazon KDP.";
  ctx.fillText(descText.slice(0, 60), mmToPx(dimensions.bleedMm + 14), height * 0.30);
  ctx.fillText(descText.slice(60, 120), mmToPx(dimensions.bleedMm + 14), height * 0.34);

  // Barcode Box
  const bcX = mmToPx(dimensions.barcodeLocation.xMm);
  const bcY = mmToPy(dimensions.barcodeLocation.yMm);
  const bcW = mmToPx(dimensions.barcodeLocation.widthMm);
  const bcH = mmToPy(dimensions.barcodeLocation.heightMm);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bcX, bcY, bcW, bcH);
  ctx.strokeStyle = '#CCCCCC';
  ctx.strokeRect(bcX, bcY, bcW, bcH);

  // Barcode lines
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 30; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(bcX + 5 + i * ((bcW - 10) / 30), bcY + 4, 1.5, bcH - 14);
    }
  }
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ISBN ${isbn}`, bcX + bcW / 2, bcY + bcH - 3);

  // Guides Overlay if requested
  if (showGuides) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Red dashed for bleed
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeRect(mmToPx(dimensions.bleedMm), mmToPy(dimensions.bleedMm), width - mmToPx(dimensions.bleedMm * 2), height - mmToPy(dimensions.bleedMm * 2));

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)'; // Blue dashed for spine
    ctx.strokeRect(spineX, 0, spineW, height);
    ctx.setLineDash([]);
  }
}
