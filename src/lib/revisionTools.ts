import { Ebook, Chapter, ChapterSection, EbookSnapshot } from '../types';

export interface SearchReplaceResult {
  updatedEbook: Ebook;
  matchesCount: number;
  replacedCount: number;
  occurrencesPerChapter: Array<{ chapterNum: number; count: number }>;
}

/**
 * Searches and replaces text globally across titles, subtitles, summaries, conclusions, and paragraph blocks.
 */
export function globalSearchAndReplace(
  ebook: Ebook,
  searchTerm: string,
  replaceTerm: string,
  options?: { caseSensitive?: boolean; wholeWord?: boolean }
): SearchReplaceResult {
  if (!searchTerm) {
    return {
      updatedEbook: ebook,
      matchesCount: 0,
      replacedCount: 0,
      occurrencesPerChapter: [],
    };
  }

  const flags = options?.caseSensitive ? 'g' : 'gi';
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patternStr = options?.wholeWord ? `\\b${escaped}\\b` : escaped;
  const regex = new RegExp(patternStr, flags);

  let totalMatches = 0;
  const chapterCounts: Array<{ chapterNum: number; count: number }> = [];

  const replaceInStr = (str?: string): string => {
    if (!str) return '';
    const matches = str.match(regex);
    if (matches) {
      totalMatches += matches.length;
    }
    return str.replace(regex, replaceTerm);
  };

  const updatedChapitres: Chapter[] = (ebook.contenu.chapitres || []).map((chap) => {
    let chapterMatches = 0;
    const countInStr = (s?: string) => {
      if (!s) return;
      const m = s.match(regex);
      if (m) chapterMatches += m.length;
    };

    countInStr(chap.titre);
    countInStr(chap.resume);
    countInStr(chap.conclusion_chapitre);

    const updatedSections: ChapterSection[] = (chap.sections || []).map((sec) => {
      countInStr(sec.titre);
      countInStr(sec.sous_titre);
      sec.paragraphes.forEach((p) => countInStr(p));

      return {
        ...sec,
        titre: replaceInStr(sec.titre),
        sous_titre: sec.sous_titre ? replaceInStr(sec.sous_titre) : undefined,
        paragraphes: sec.paragraphes.map((p) => replaceInStr(p)),
      };
    });

    chapterCounts.push({ chapterNum: chap.numero, count: chapterMatches });

    return {
      ...chap,
      titre: replaceInStr(chap.titre),
      resume: replaceInStr(chap.resume),
      conclusion_chapitre: chap.conclusion_chapitre ? replaceInStr(chap.conclusion_chapitre) : undefined,
      sections: updatedSections,
    };
  });

  const updatedEbook: Ebook = {
    ...ebook,
    titre: replaceInStr(ebook.titre),
    sous_titre: replaceInStr(ebook.sous_titre),
    description: replaceInStr(ebook.description),
    contenu: {
      ...ebook.contenu,
      introduction: replaceInStr(ebook.contenu.introduction),
      conclusion: replaceInStr(ebook.contenu.conclusion),
      preface: ebook.contenu.preface ? replaceInStr(ebook.contenu.preface) : undefined,
      epilogue: ebook.contenu.epilogue ? replaceInStr(ebook.contenu.epilogue) : undefined,
      chapitres: updatedChapitres,
    },
    updated_at: new Date().toISOString(),
  };

  return {
    updatedEbook,
    matchesCount: totalMatches,
    replacedCount: totalMatches,
    occurrencesPerChapter: chapterCounts,
  };
}

export interface TypographyFixReport {
  nonBreakingSpacesAdded: number;
  quotesCorrected: number;
  dashesFormatted: number;
  doubleSpacesFixed: number;
  totalCorrections: number;
}

/**
 * Automatically cleans and formats French typography standards:
 * - Inserts non-breaking spaces (\u00A0) before : ; ! ? % € $ » and after «
 * - Converts "..." to French guillemets « ... »
 * - Replaces double dashes -- with em-dashes —
 * - Cleans multiple consecutive spaces
 */
export function cleanFrenchTypography(ebook: Ebook): {
  updatedEbook: Ebook;
  report: TypographyFixReport;
} {
  let nonBreakingSpacesAdded = 0;
  let quotesCorrected = 0;
  let dashesFormatted = 0;
  let doubleSpacesFixed = 0;

  const fixText = (text?: string): string => {
    if (!text) return '';
    let res = text;

    // 1. Multiple spaces to single space
    const doubleSpacesMatches = res.match(/[ ]{2,}/g);
    if (doubleSpacesMatches) {
      doubleSpacesFixed += doubleSpacesMatches.length;
      res = res.replace(/[ ]{2,}/g, ' ');
    }

    // 2. French Guillemets « and »
    // Convert "text" to « text »
    const quotePattern = /"([^"]+)"/g;
    const qMatches = res.match(quotePattern);
    if (qMatches) {
      quotesCorrected += qMatches.length;
      res = res.replace(quotePattern, '«\u00A0$1\u00A0»');
    }

    // 3. Non-breaking spaces before high punctuation: ? ! : ; % € $
    const punctPattern = /([^\s\u00A0])\s*([?!:;%€$])/g;
    const punctMatches = res.match(punctPattern);
    if (punctMatches) {
      nonBreakingSpacesAdded += punctMatches.length;
      res = res.replace(punctPattern, '$1\u00A0$2');
    }

    // 4. Non-breaking spaces inside « and »
    res = res.replace(/«\s*/g, '«\u00A0');
    res = res.replace(/\s*»/g, '\u00A0»');

    // 5. Em dashes
    const dashMatches = res.match(/--/g);
    if (dashMatches) {
      dashesFormatted += dashMatches.length;
      res = res.replace(/--/g, '—');
    }

    return res;
  };

  const updatedChapitres: Chapter[] = (ebook.contenu.chapitres || []).map((chap) => ({
    ...chap,
    titre: fixText(chap.titre),
    resume: fixText(chap.resume),
    conclusion_chapitre: chap.conclusion_chapitre ? fixText(chap.conclusion_chapitre) : undefined,
    sections: (chap.sections || []).map((sec) => ({
      ...sec,
      titre: fixText(sec.titre),
      sous_titre: sec.sous_titre ? fixText(sec.sous_titre) : undefined,
      paragraphes: sec.paragraphes.map((p) => fixText(p)),
    })),
  }));

  const updatedEbook: Ebook = {
    ...ebook,
    titre: fixText(ebook.titre),
    sous_titre: fixText(ebook.sous_titre),
    description: fixText(ebook.description),
    contenu: {
      ...ebook.contenu,
      introduction: fixText(ebook.contenu.introduction),
      conclusion: fixText(ebook.contenu.conclusion),
      preface: ebook.contenu.preface ? fixText(ebook.contenu.preface) : undefined,
      epilogue: ebook.contenu.epilogue ? fixText(ebook.contenu.epilogue) : undefined,
      chapitres: updatedChapitres,
    },
    updated_at: new Date().toISOString(),
  };

  const totalCorrections =
    nonBreakingSpacesAdded + quotesCorrected + dashesFormatted + doubleSpacesFixed;

  return {
    updatedEbook,
    report: {
      nonBreakingSpacesAdded,
      quotesCorrected,
      dashesFormatted,
      doubleSpacesFixed,
      totalCorrections,
    },
  };
}

/**
 * Local Snapshot & Version Management
 */
const SNAPSHOTS_KEY_PREFIX = 'manuscrit_studio_snapshots_';

export function getEbookSnapshots(ebookId: string): EbookSnapshot[] {
  try {
    const raw = localStorage.getItem(`${SNAPSHOTS_KEY_PREFIX}${ebookId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEbookSnapshot(ebook: Ebook, label: string): EbookSnapshot {
  const snapshots = getEbookSnapshots(ebook.id);
  const wordsCount = ebook.contenu.metadata?.mots_total || 
    JSON.stringify(ebook.contenu).split(/\s+/).length;

  const newSnapshot: EbookSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ebook_id: ebook.id,
    label: label.trim() || `Version ${snapshots.length + 1} (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
    created_at: new Date().toISOString(),
    words_count: wordsCount,
    chapters_count: ebook.contenu.chapitres?.length || 0,
    data: JSON.parse(JSON.stringify(ebook)),
  };

  const updated = [newSnapshot, ...snapshots].slice(0, 15); // Keep up to 15 snapshots
  try {
    localStorage.setItem(`${SNAPSHOTS_KEY_PREFIX}${ebook.id}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Erreur sauvegarde snapshot:', e);
  }

  return newSnapshot;
}

export function deleteEbookSnapshot(ebookId: string, snapshotId: string): void {
  const snapshots = getEbookSnapshots(ebookId);
  const filtered = snapshots.filter((s) => s.id !== snapshotId);
  localStorage.setItem(`${SNAPSHOTS_KEY_PREFIX}${ebookId}`, JSON.stringify(filtered));
}
