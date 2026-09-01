import JSZip from 'jszip';
import { Ebook } from '../types';

export interface EpubExportOptions {
  authorName?: string;
  publisher?: string;
  language?: string;
  coverTheme?: 'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche';
  collectionLabel?: string;
}

interface BundledImage {
  id: string;
  filename: string;
  mediaType: string;
  data: Blob | string;
  originalUrl: string;
}

/**
 * Escapes characters for XML / XHTML compliance
 */
function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats inline text (markdown bold, italic, code, and Kindle pop-up footnotes) for XHTML
 */
function formatInlineText(unsafe?: string, imageMap?: Map<string, string>): string {
  if (!unsafe) return '';

  // Extract inline markdown images first
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
  const segments: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(unsafe)) !== null) {
    if (match.index > lastIndex) {
      segments.push(processTypography(unsafe.substring(lastIndex, match.index)));
    }
    const caption = match[1] || '';
    const rawUrl = match[2];
    const localHref = (imageMap && imageMap.get(rawUrl)) || rawUrl;
    const escUrl = escapeXml(localHref);
    const escCap = escapeXml(caption);

    segments.push(
      `</p><figure class="illustration"><img src="${escUrl}" alt="${escCap || 'Illustration'}" />${
        escCap ? `<figcaption>${escCap}</figcaption>` : ''
      }</figure><p>`
    );
    lastIndex = imageRegex.lastIndex;
  }

  if (lastIndex < unsafe.length) {
    segments.push(processTypography(unsafe.substring(lastIndex)));
  }

  return segments.join('');
}

/**
 * Processes typography tags in plain text
 */
function processTypography(text: string): string {
  let escaped = escapeXml(text);
  // Bold **text** or __text__
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');
  // Inline code `code`
  escaped = escaped.replace(/`(.*?)`/g, '<code class="code-inline">$1</code>');
  // Footnote references [^1] with Kindle/Kobo pop-up support
  escaped = escaped.replace(
    /\[\^(\d+)\]/g,
    '<a epub:type="noteref" href="#fn_$1" id="fnref_$1" class="footnote-ref">[$1]</a>'
  );
  return escaped;
}

/**
 * Generates an e-reader CSS stylesheet designed for fluid typography,
 * high legibility on E-Ink screens (Kindle Paperwhite/Oasis/Scribe, Kobo Clara/Libra/Sage)
 * and tablet apps (Apple Books, Google Play Books, Calibre, Lithium).
 */
function getEpubCss(): string {
  return `@charset "utf-8";

/* ==========================================================================
   Fluid & Reflowable Typography for E-Readers (Kindle, Kobo, Apple Books)
   ========================================================================== */

@namespace epub "http://www.idpf.org/2007/ops";

body {
  margin: 4% 5%;
  padding: 0;
  font-family: "Newsreader", "Georgia", "Iowan Old Style", "Palatino", "Book Antiqua", serif;
  font-size: 1.05em;
  line-height: 1.65;
  text-align: justify;
  text-justify: inter-word;
  color: #1A1815;
  background-color: transparent;
  hyphens: auto;
  -webkit-hyphens: auto;
  -epub-hyphens: auto;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: "Cinzel", "Fraunces", "Georgia", serif;
  font-weight: bold;
  line-height: 1.25;
  text-align: center;
  page-break-after: avoid;
  break-after: avoid;
}

h1.book-title {
  font-size: 2.1em;
  margin-top: 12%;
  margin-bottom: 0.3em;
  letter-spacing: 0.05em;
  color: #1C1A17;
}

.book-subtitle {
  font-size: 1.2em;
  font-style: italic;
  text-align: center;
  color: #544A39;
  margin-bottom: 2em;
}

.book-author {
  font-size: 1.15em;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8C2D19;
  margin-bottom: 1.5em;
}

.publisher-note {
  font-size: 0.85em;
  text-align: center;
  font-style: italic;
  color: #6E6352;
  margin-top: 20%;
  border-top: 1px solid #D8CCB5;
  padding-top: 1.2em;
}

/* Cover page */
.cover-page {
  margin: 0;
  padding: 0;
  text-align: center;
  height: 100%;
}

.cover-image {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  margin: 0 auto;
  display: block;
}

/* Chapter Headers */
.chapter-header {
  margin-top: 8%;
  margin-bottom: 2em;
  text-align: center;
  page-break-after: avoid;
  break-after: avoid;
}

.chapter-number {
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #8C2D19;
  margin-bottom: 0.4em;
}

.chapter-title {
  font-size: 1.75em;
  margin: 0.2em 0 0.5em 0;
  color: #1F1A14;
}

.chapter-divider {
  width: 44px;
  height: 2px;
  background-color: #8C2D19;
  margin: 1.2em auto;
  border: none;
}

.chapter-summary {
  font-style: italic;
  font-size: 0.95em;
  color: #4A4030;
  background-color: #F8F5EE;
  border-left: 3px solid #8C2D19;
  padding: 0.9em 1.1em;
  margin: 1.5em 0 2em 0;
  border-radius: 4px;
}

.key-points-box {
  background-color: #FAF7F0;
  border: 1px solid #E2D7C3;
  padding: 1em 1.2em;
  margin: 1.5em 0;
  border-radius: 4px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.key-points-title {
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8C2D19;
  margin-bottom: 0.5em;
}

.key-points-box ul {
  margin: 0;
  padding-left: 1.4em;
}

.key-points-box li {
  margin-bottom: 0.3em;
  font-size: 0.95em;
}

/* Section Headings */
h2.section-title {
  font-size: 1.3em;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 0.3em;
  color: #2E2820;
  border-bottom: 1px solid #E8DFCC;
  padding-bottom: 0.3em;
  page-break-after: avoid;
  break-after: avoid;
}

.section-subtitle {
  font-size: 0.95em;
  font-style: italic;
  color: #6E6352;
  margin-bottom: 1.2em;
}

/* Paragraphs & Text flow */
p {
  margin-top: 0;
  margin-bottom: 0.75em;
  text-indent: 1.4em;
}

p.no-indent,
.chapter-summary p,
.key-points-box p {
  text-indent: 0;
}

/* Dropcap for opening paragraph */
p.first-paragraph::first-letter {
  font-size: 3.2em;
  float: left;
  line-height: 0.8;
  margin: 0.05em 0.15em 0 0;
  font-family: "Cinzel", "Georgia", serif;
  font-weight: bold;
  color: #8C2D19;
}

/* Blockquotes & Callouts */
blockquote, .callout-quote {
  margin: 1.6em 0.8em;
  padding: 0.8em 1.2em;
  border-left: 3px solid #8C2D19;
  background-color: #F8F5EE;
  font-style: italic;
  font-size: 1.02em;
  color: #2E2820;
  page-break-inside: avoid;
  break-inside: avoid;
}

blockquote p, .callout-quote p {
  text-indent: 0;
  margin-bottom: 0.4em;
}

.callout-author {
  display: block;
  font-style: normal;
  font-size: 0.85em;
  font-weight: bold;
  text-align: right;
  color: #8C2D19;
  margin-top: 0.5em;
}

/* Figures & Illustrations */
figure.illustration {
  margin: 1.8em auto;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
}

figure.illustration img {
  max-width: 96%;
  height: auto;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
  border: 1px solid #E2D7C3;
}

figure.illustration figcaption {
  font-size: 0.85em;
  font-style: italic;
  color: #554A3B;
  margin-top: 0.6em;
  text-align: center;
}

/* Table of Contents in EPUB */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 2em 0;
}

.toc-item {
  margin-bottom: 0.8em;
  border-bottom: 1px dotted #D5CAB7;
  padding-bottom: 0.4em;
}

.toc-item a {
  text-decoration: none;
  color: #1F1A14;
  font-weight: bold;
}

/* Footnotes & Kindle pop-up notes */
.footnote-ref {
  font-size: 0.75em;
  line-height: 0;
  vertical-align: super;
  text-decoration: none;
  font-weight: bold;
  color: #8C2D19;
  padding: 0 0.15em;
}

.footnotes-section {
  margin-top: 2.5em;
  padding-top: 1.2em;
  border-top: 1px solid #D5CAB7;
  font-size: 0.85em;
  color: #4A4030;
  font-style: italic;
}

.footnotes-section ol {
  padding-left: 1.4em;
  margin-top: 0.5em;
}

.footnotes-section li {
  margin-bottom: 0.5em;
  line-height: 1.4;
}

.chapter-synthesis {
  background-color: #F4EFE6;
  border: 1px solid #D5CAB7;
  padding: 1.1em;
  margin: 2.2em 0 1em 0;
  border-radius: 4px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.synthesis-tag {
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
  color: #8C2D19;
  margin-bottom: 0.4em;
}

.code-inline {
  font-family: monospace;
  font-size: 0.9em;
  background: #F0EBE1;
  padding: 2px 4px;
  border-radius: 3px;
}

/* Page Break Utility */
.pagebreak {
  page-break-before: always;
  break-before: page;
}

/* Dark Mode on E-readers (Kindle Dark Mode, Apple Books, Kobo) */
@media (prefers-color-scheme: dark) {
  body {
    color: #E2E8F0;
  }
  h1, h2, h3, h4, h5, h6, h1.book-title, .chapter-title {
    color: #F8FAFC;
  }
  .book-author, .chapter-number, .synthesis-tag, .footnote-ref {
    color: #93C5FD;
  }
  .chapter-summary, blockquote, .callout-quote, .key-points-box, .chapter-synthesis {
    background-color: #1E293B;
    color: #E2E8F0;
    border-color: #334155;
  }
  .toc-item {
    border-color: #334155;
  }
  .toc-item a {
    color: #F1F5F9;
  }
}
`;
}

/**
 * Builds standard EPUB 3 container XML
 */
function getContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

/**
 * Generates NCX file for legacy EPUB 2 readers / Kindle conversion (Amazon KDP, older Kindles)
 */
function generateNcx(ebook: Ebook, bookId: string, author: string): string {
  let playOrder = 1;
  const navPoints: string[] = [];

  // Cover
  navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Couverture</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>`);
  playOrder++;

  // Title page
  navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Page de Titre</text></navLabel>
      <content src="title.xhtml"/>
    </navPoint>`);
  playOrder++;

  // Sommaire
  navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Table des Matières</text></navLabel>
      <content src="toc.xhtml"/>
    </navPoint>`);
  playOrder++;

  // Introduction
  if (ebook.contenu.introduction) {
    navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Introduction</text></navLabel>
      <content src="intro.xhtml"/>
    </navPoint>`);
    playOrder++;
  }

  // Chapters
  ebook.contenu.chapitres?.forEach((chap, idx) => {
    navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Chapitre ${chap.numero} : ${escapeXml(chap.titre)}</text></navLabel>
      <content src="chapter_${idx + 1}.xhtml"/>
    </navPoint>`);
    playOrder++;
  });

  // Conclusion
  if (ebook.contenu.conclusion) {
    navPoints.push(`
    <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
      <navLabel><text>Conclusion &amp; Perspectives</text></navLabel>
      <content src="conclusion.xhtml"/>
    </navPoint>`);
    playOrder++;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(ebook.titre)}</text>
  </docTitle>
  <docAuthor>
    <text>${escapeXml(author)}</text>
  </docAuthor>
  <navMap>
    ${navPoints.join('\n')}
  </navMap>
</ncx>`;
}

/**
 * Generates EPUB 3 Navigation Document (nav.xhtml) with Landmarks
 */
function generateNavXhtml(ebook: Ebook): string {
  const items: string[] = [];

  items.push(`<li><a href="cover.xhtml">Couverture</a></li>`);
  items.push(`<li><a href="title.xhtml">Page de Titre</a></li>`);
  items.push(`<li><a href="toc.xhtml">Sommaire</a></li>`);

  if (ebook.contenu.introduction) {
    items.push(`<li><a href="intro.xhtml">Introduction</a></li>`);
  }

  ebook.contenu.chapitres?.forEach((chap, idx) => {
    let subList = '';
    if (chap.sections && chap.sections.length > 0) {
      const subItems = chap.sections
        .map((s, sIdx) => `<li><a href="chapter_${idx + 1}.xhtml#sec_${sIdx + 1}">${escapeXml(s.titre)}</a></li>`)
        .join('\n');
      subList = `\n<ol>\n${subItems}\n</ol>`;
    }
    items.push(`<li><a href="chapter_${idx + 1}.xhtml">Chapitre ${chap.numero} : ${escapeXml(chap.titre)}</a>${subList}</li>`);
  });

  if (ebook.contenu.conclusion) {
    items.push(`<li><a href="conclusion.xhtml">Conclusion &amp; Perspectives</a></li>`);
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="fr" xml:lang="fr">
<head>
  <title>Navigation</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table des Matières</h1>
    <ol>
      ${items.join('\n      ')}
    </ol>
  </nav>

  <nav epub:type="landmarks" hidden="">
    <h2>Repères</h2>
    <ol>
      <li><a epub:type="cover" href="cover.xhtml">Couverture</a></li>
      <li><a epub:type="toc" href="toc.xhtml">Table des Matières</a></li>
      <li><a epub:type="bodymatter" href="${ebook.contenu.introduction ? 'intro.xhtml' : 'chapter_1.xhtml'}">Début de lecture</a></li>
    </ol>
  </nav>
</body>
</html>`;
}

/**
 * Generates OPF Package Document (content.opf) compliant with EPUB 3.0, Kindle, and Kobo
 */
function generateOpf(
  ebook: Ebook,
  bookId: string,
  author: string,
  bundledImages: BundledImage[],
  options?: EpubExportOptions
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const lang = options?.language || 'fr';
  const publisher = options?.publisher || 'Studio Manuscrit • SileyaBook';

  const manifestItems: string[] = [
    `<item id="css" href="styles.css" media-type="text/css"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="coverpage" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="titlepage" href="title.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="tocpage" href="toc.xhtml" media-type="application/xhtml+xml"/>`,
  ];

  const spineItems: string[] = [
    `<itemref idref="coverpage"/>`,
    `<itemref idref="titlepage"/>`,
    `<itemref idref="tocpage"/>`,
  ];

  if (ebook.contenu.introduction) {
    manifestItems.push(`<item id="intro" href="intro.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="intro"/>`);
  }

  ebook.contenu.chapitres?.forEach((_, idx) => {
    const id = `chap_${idx + 1}`;
    manifestItems.push(`<item id="${id}" href="chapter_${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${id}"/>`);
  });

  if (ebook.contenu.conclusion) {
    manifestItems.push(`<item id="conclusion" href="conclusion.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="conclusion"/>`);
  }

  // Embedded images in manifest
  bundledImages.forEach((img) => {
    const isCover = img.id === 'cover-image';
    const props = isCover ? ' properties="cover-image"' : '';
    manifestItems.push(
      `<item id="${img.id}" href="${img.filename}" media-type="${img.mediaType}"${props}/>`
    );
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0" prefix="rendition: http://www.idpf.org/vocab/rendition/#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">urn:uuid:${bookId}</dc:identifier>
    <dc:title>${escapeXml(ebook.titre)}</dc:title>
    <dc:creator id="creator">${escapeXml(author)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <dc:language>${lang}</dc:language>
    <dc:publisher>${escapeXml(publisher)}</dc:publisher>
    <dc:date>${dateStr}</dc:date>
    <dc:description>${escapeXml(ebook.description || '')}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta property="rendition:layout">reflowable</meta>
    <meta property="rendition:orientation">auto</meta>
    <meta property="rendition:spread">auto</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
  <guide>
    <reference type="cover" title="Couverture" href="cover.xhtml"/>
    <reference type="toc" title="Table des Matières" href="toc.xhtml"/>
    <reference type="text" title="Début du Manuscrit" href="${ebook.contenu.introduction ? 'intro.xhtml' : 'chapter_1.xhtml'}"/>
  </guide>
</package>`;
}

/**
 * Creates the Cover XHTML page
 */
function generateCoverXhtml(ebook: Ebook): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="fr" xml:lang="fr">
<head>
  <title>Couverture - ${escapeXml(ebook.titre)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body class="cover-page" epub:type="cover">
  <div style="text-align: center; padding: 0; margin: 0;">
    <img src="images/cover.jpg" alt="Couverture : ${escapeXml(ebook.titre)}" class="cover-image"/>
  </div>
</body>
</html>`;
}

/**
 * Creates the Title XHTML page
 */
function generateTitlePageXhtml(ebook: Ebook, author: string): string {
  const genre = ebook.contenu.metadata?.genre || 'Édition & Manuscrit';

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr" xml:lang="fr">
<head>
  <title>${escapeXml(ebook.titre)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body class="title-page">
  <div style="text-align: center; margin-top: 10%;">
    <p class="no-indent" style="font-size: 0.85em; letter-spacing: 0.2em; text-transform: uppercase; color: #8C2D19; margin-bottom: 2em;">
      — ${escapeXml(genre)} —
    </p>

    <h1 class="book-title">${escapeXml(ebook.titre)}</h1>

    ${ebook.sous_titre ? `<p class="book-subtitle">${escapeXml(ebook.sous_titre)}</p>` : ''}

    <div style="width: 50px; height: 1px; background-color: #8C2D19; margin: 2em auto;"></div>

    <p class="book-author">${escapeXml(author)}</p>

    ${
      ebook.description
        ? `
      <div style="margin: 3em auto; max-width: 80%; background-color: #F8F5EE; border: 1px solid #D8CCB5; padding: 1.2em; border-radius: 4px; text-align: justify; font-style: italic; font-size: 0.95em; color: #3F372C;">
        ${escapeXml(ebook.description)}
      </div>
    `
        : ''
    }

    <div class="publisher-note">
      <p class="no-indent">Publié avec <strong>Studio Manuscrit</strong></p>
      <p class="no-indent" style="font-size: 0.85em; opacity: 0.8;">Édition EPUB Reflowable • Conforme Kindle, Kobo, Apple Books</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Creates the Sommaire XHTML page
 */
function generateTocPageXhtml(ebook: Ebook): string {
  const items: string[] = [];

  if (ebook.contenu.introduction) {
    items.push(`
      <li class="toc-item">
        <a href="intro.xhtml">Introduction Préliminaire</a>
      </li>`);
  }

  ebook.contenu.chapitres?.forEach((chap, idx) => {
    items.push(`
      <li class="toc-item">
        <a href="chapter_${idx + 1}.xhtml">Chapitre ${chap.numero} : ${escapeXml(chap.titre)}</a>
      </li>`);
  });

  if (ebook.contenu.conclusion) {
    items.push(`
      <li class="toc-item">
        <a href="conclusion.xhtml">Conclusion &amp; Perspectives</a>
      </li>`);
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr" xml:lang="fr">
<head>
  <title>Sommaire</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter-header">
    <h1 class="chapter-title" style="font-size: 1.8em;">Table des Matières</h1>
    <div class="chapter-divider"></div>
  </div>

  <ul class="toc-list">
    ${items.join('\n')}
  </ul>
</body>
</html>`;
}

/**
 * Creates Introduction XHTML
 */
function generateIntroXhtml(ebook: Ebook, imageMap?: Map<string, string>): string {
  const paragraphs = (ebook.contenu.introduction || '')
    .split('\n\n')
    .filter((p) => p.trim().length > 0)
    .map((p, idx) => `<p class="${idx === 0 ? 'first-paragraph' : ''}">${formatInlineText(p.trim(), imageMap)}</p>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr" xml:lang="fr">
<head>
  <title>Introduction</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter-header">
    <div class="chapter-number">PROLÉGOMÈNES</div>
    <h1 class="chapter-title">Introduction</h1>
    <div class="chapter-divider"></div>
  </div>

  ${paragraphs}
</body>
</html>`;
}

/**
 * Creates Chapter XHTML
 */
function generateChapterXhtml(
  chap: Ebook['contenu']['chapitres'][0],
  imageMap?: Map<string, string>
): string {
  // Key points
  let keyPointsHtml = '';
  if (chap.points_cles && chap.points_cles.length > 0) {
    const listItems = chap.points_cles
      .map((pt) => `<li>${formatInlineText(pt, imageMap)}</li>`)
      .join('\n');
    keyPointsHtml = `
    <div class="key-points-box">
      <div class="key-points-title">Points clés abordés :</div>
      <ul>
        ${listItems}
      </ul>
    </div>`;
  }

  // Sections
  const sectionsHtml = (chap.sections || [])
    .map((sec, sIdx) => {
      const pTags = (sec.paragraphes || [])
        .map((p, pIdx) => {
          const formattedText = formatInlineText(p, imageMap);
          return `<p class="${sIdx === 0 && pIdx === 0 ? 'first-paragraph' : ''}">${formattedText}</p>`;
        })
        .join('\n');

      let footnotesHtml = '';
      if (sec.notes_de_bas_de_page && sec.notes_de_bas_de_page.length > 0) {
        const fnItems = sec.notes_de_bas_de_page
          .map(
            (fn) => `
        <li id="fn_${fn.reference_number}" epub:type="footnote">
          ${fn.terme_cible ? `<strong>${escapeXml(fn.terme_cible)}</strong> : ` : ''}${formatInlineText(fn.contenu, imageMap)}
          <a href="#fnref_${fn.reference_number}" class="footnote-ref">↩</a>
        </li>`
          )
          .join('\n');

        footnotesHtml = `
      <div class="footnotes-section" epub:type="footnotes">
        <div style="font-weight: bold; font-size: 0.9em; text-transform: uppercase; color: #8C2D19; margin-bottom: 0.3em;">Notes &amp; Références :</div>
        <ol>
          ${fnItems}
        </ol>
      </div>`;
      }

      return `
    <section id="sec_${sIdx + 1}">
      <h2 class="section-title">${escapeXml(sec.titre)}</h2>
      ${sec.sous_titre ? `<div class="section-subtitle">${escapeXml(sec.sous_titre)}</div>` : ''}
      ${pTags}
      ${footnotesHtml}
    </section>`;
    })
    .join('\n');

  // Chapter conclusion
  let conclusionHtml = '';
  if (chap.conclusion_chapitre) {
    conclusionHtml = `
    <div class="chapter-synthesis">
      <div class="synthesis-tag">Synthèse du Chapitre</div>
      <p class="no-indent" style="font-style: italic;">${formatInlineText(chap.conclusion_chapitre, imageMap)}</p>
    </div>`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="fr" xml:lang="fr">
<head>
  <title>Chapitre ${chap.numero} : ${escapeXml(chap.titre)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter-header">
    <div class="chapter-number">Chapitre ${chap.numero}</div>
    <h1 class="chapter-title">${escapeXml(chap.titre)}</h1>
    <div class="chapter-divider"></div>
  </div>

  ${keyPointsHtml}
  ${sectionsHtml}
  ${conclusionHtml}
</body>
</html>`;
}

/**
 * Creates Conclusion XHTML
 */
function generateConclusionXhtml(ebook: Ebook, imageMap?: Map<string, string>): string {
  const paragraphs = (ebook.contenu.conclusion || '')
    .split('\n\n')
    .filter((p) => p.trim().length > 0)
    .map((p, idx) => `<p class="${idx === 0 ? 'first-paragraph' : ''}">${formatInlineText(p.trim(), imageMap)}</p>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr" xml:lang="fr">
<head>
  <title>Conclusion &amp; Perspectives</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter-header">
    <div class="chapter-number">ÉPILOGUE</div>
    <h1 class="chapter-title">Conclusion &amp; Perspectives</h1>
    <div class="chapter-divider"></div>
  </div>

  ${paragraphs}
</body>
</html>`;
}

/**
 * Renders a high-resolution JPEG Cover image for Kindle and Kobo e-reader thumbnails
 */
async function renderCoverImageJpeg(ebook: Ebook, options?: EpubExportOptions): Promise<Blob | null> {
  try {
    const width = 1200;
    const height = 1800;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const themeKey = options?.coverTheme || (ebook.cover_theme as any) || 'velin';
    const author = options?.authorName || 'Auteur du Manuscrit';
    const collection = options?.collectionLabel || ebook.contenu.metadata?.genre || 'MANUSCRIT & GUIDE ÉDITORIAL';

    const themeStyles: Record<string, { bg: string; text: string; accent: string; sub: string; border: string; dark: boolean }> = {
      velin: { bg: '#F0F7FF', text: '#0F2346', accent: '#1D4ED8', sub: '#335C80', border: '#93C5FD', dark: false },
      carmin: { bg: '#0B1938', text: '#FAF7F0', accent: '#60A5FA', sub: '#BFDBFE', border: '#93C5FD', dark: true },
      nuit: { bg: '#080E1C', text: '#F8FAFC', accent: '#93C5FD', sub: '#93C5FD', border: '#60A5FA', dark: true },
      emeraude: { bg: '#081F38', text: '#F0F9FF', accent: '#38BDF8', sub: '#BAE6FD', border: '#3B82F6', dark: true },
      blanche: { bg: '#F8FBFF', text: '#0F172A', accent: '#2563EB', sub: '#3B82F6', border: '#BFDBFE', dark: false },
    };

    const curTheme = themeStyles[themeKey] || themeStyles.velin;

    // Background
    ctx.fillStyle = curTheme.bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
    if (curTheme.dark) {
      grad.addColorStop(0, 'rgba(255,255,255,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    } else {
      grad.addColorStop(0, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(0,0,0,0.08)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Double frame
    ctx.strokeStyle = curTheme.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, width - 110, height - 110);

    // Top collection badge
    ctx.font = 'bold 24px "Cinzel", Georgia, serif';
    ctx.fillStyle = curTheme.accent;
    ctx.textAlign = 'center';
    ctx.fillText(collection.toUpperCase(), width / 2, 160);

    // Divider
    ctx.strokeStyle = curTheme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, 200);
    ctx.lineTo(width / 2 + 80, 200);
    ctx.stroke();

    // Main Title
    ctx.fillStyle = curTheme.text;
    ctx.font = 'bold 64px "Cinzel", "Fraunces", Georgia, serif';
    const words = ebook.titre.split(' ');
    let line = '';
    let curY = 560;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 240 && i > 0) {
        ctx.fillText(line.trim(), width / 2, curY);
        line = words[i] + ' ';
        curY += 78;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, curY);

    // Subtitle
    if (ebook.sous_titre) {
      curY += 60;
      ctx.font = 'italic 34px "Newsreader", Georgia, serif';
      ctx.fillStyle = curTheme.sub;
      ctx.fillText(ebook.sous_titre, width / 2, curY, width - 240);
    }

    // Author at bottom
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.fillStyle = curTheme.accent;
    ctx.fillText(author.toUpperCase(), width / 2, height - 220);

    // Publisher footnote
    ctx.font = '18px sans-serif';
    ctx.fillStyle = curTheme.sub;
    ctx.fillText('STUDIO MANUSCRIT • ÉDITION NUMÉRIQUE', width / 2, height - 140);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });
  } catch (err) {
    console.warn("Impossible de générer l'image de couverture EPUB:", err);
    return null;
  }
}

/**
 * Extracts all inline markdown illustrations and prepares them for embedding inside the EPUB
 */
async function bundleEbookImages(ebook: Ebook): Promise<{
  bundled: BundledImage[];
  imageMap: Map<string, string>;
}> {
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
  const rawUrls: string[] = [];

  // Find all images across chapters, introduction, and conclusion
  const scanText = (text?: string) => {
    if (!text) return;
    let match: RegExpExecArray | null;
    while ((match = imageRegex.exec(text)) !== null) {
      if (match[2] && !rawUrls.includes(match[2])) {
        rawUrls.push(match[2]);
      }
    }
  };

  scanText(ebook.contenu.introduction);
  scanText(ebook.contenu.conclusion);
  ebook.contenu.chapitres?.forEach((c) => {
    scanText(c.resume);
    c.sections?.forEach((s) => {
      s.paragraphes?.forEach((p) => scanText(p));
    });
  });

  const bundled: BundledImage[] = [];
  const imageMap = new Map<string, string>();

  let imgIndex = 1;
  for (const url of rawUrls) {
    try {
      let blob: Blob | null = null;
      let ext = 'jpg';
      let mediaType = 'image/jpeg';

      if (url.startsWith('data:image/png')) {
        ext = 'png';
        mediaType = 'image/png';
        const res = await fetch(url);
        blob = await res.blob();
      } else if (url.startsWith('data:image/')) {
        const res = await fetch(url);
        blob = await res.blob();
      } else {
        const res = await fetch(url);
        if (res.ok) {
          blob = await res.blob();
          if (blob.type === 'image/png') {
            ext = 'png';
            mediaType = 'image/png';
          }
        }
      }

      if (blob) {
        const filename = `images/illustration_${imgIndex}.${ext}`;
        const id = `illu_${imgIndex}`;
        bundled.push({
          id,
          filename,
          mediaType,
          data: blob,
          originalUrl: url,
        });
        imageMap.set(url, filename);
        imgIndex++;
      }
    } catch (err) {
      console.warn(`Impossible de pré-intégrer l'image EPUB ${url}:`, err);
    }
  }

  return { bundled, imageMap };
}

/**
 * Generates an EPUB 3 document Blob using JSZip, strictly formatted for Amazon Kindle & Rakuten Kobo
 */
export async function generateEpubBlob(ebook: Ebook, options?: EpubExportOptions): Promise<Blob> {
  const zip = new JSZip();
  const bookId = ebook.id || (Math.random().toString(36).substring(2) + Date.now().toString(36));
  const author = options?.authorName || 'Auteur du Manuscrit';

  // 1. mimetype (MUST be the first entry, uncompressed, exactly 20 bytes for EPUB specification)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file('META-INF/container.xml', getContainerXml());

  // 3. OEBPS folder structure
  const oebps = zip.folder('OEBPS');
  if (!oebps) {
    throw new Error('Erreur lors de la création du dossier OEBPS');
  }

  // Pre-bundle images and generate cover
  const { bundled, imageMap } = await bundleEbookImages(ebook);
  const coverBlob = await renderCoverImageJpeg(ebook, options);

  if (coverBlob) {
    bundled.unshift({
      id: 'cover-image',
      filename: 'images/cover.jpg',
      mediaType: 'image/jpeg',
      data: coverBlob,
      originalUrl: 'cover',
    });
  }

  // Embed images in OEBPS/images/
  bundled.forEach((img) => {
    oebps.file(img.filename, img.data);
  });

  // CSS Stylesheet
  oebps.file('styles.css', getEpubCss());

  // OPF & Navigation (NCX + EPUB3 Nav)
  oebps.file('content.opf', generateOpf(ebook, bookId, author, bundled, options));
  oebps.file('toc.ncx', generateNcx(ebook, bookId, author));
  oebps.file('nav.xhtml', generateNavXhtml(ebook));

  // Content XHTML Pages
  oebps.file('cover.xhtml', generateCoverXhtml(ebook));
  oebps.file('title.xhtml', generateTitlePageXhtml(ebook, author));
  oebps.file('toc.xhtml', generateTocPageXhtml(ebook));

  if (ebook.contenu.introduction) {
    oebps.file('intro.xhtml', generateIntroXhtml(ebook, imageMap));
  }

  ebook.contenu.chapitres?.forEach((chap, idx) => {
    oebps.file(`chapter_${idx + 1}.xhtml`, generateChapterXhtml(chap, imageMap));
  });

  if (ebook.contenu.conclusion) {
    oebps.file('conclusion.xhtml', generateConclusionXhtml(ebook, imageMap));
  }

  // Generate binary EPUB zip
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return blob;
}

/**
 * Generates an EPUB 3 ArrayBuffer for in-browser rendering with epubjs
 */
export async function generateEpubArrayBuffer(ebook: Ebook, options?: EpubExportOptions): Promise<ArrayBuffer> {
  const blob = await generateEpubBlob(ebook, options);
  return await blob.arrayBuffer();
}

/**
 * Directly triggers browser download of the EPUB file
 */
export async function exportEbookToEpub(ebook: Ebook, options?: EpubExportOptions): Promise<void> {
  const blob = await generateEpubBlob(ebook, options);
  const sanitizedTitle = (ebook.titre || 'manuscrit').replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizedTitle}_ebook.epub`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
