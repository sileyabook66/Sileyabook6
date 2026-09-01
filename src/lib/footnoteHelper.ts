import { Footnote } from '../types';

export interface InlineFootnoteToken {
  type: 'text' | 'footnote';
  text?: string;
  footnote?: Footnote;
  refNumber?: number;
}

/**
 * Parses paragraph text and extracts footnote references.
 * Supported patterns:
 * - [^1] or [^2] (Standard Markdown / Pandoc footnote syntax)
 * - [note:1] or [note: 1]
 * - ((1)) or [[1]]
 * - Or matching by defined target term if available
 */
export function parseParagraphWithFootnotes(
  paragraph: string,
  availableFootnotes: Footnote[] = []
): InlineFootnoteToken[] {
  if (!paragraph) return [];

  // Create lookup map for quick access by reference_number or id
  const footnoteMap = new Map<number, Footnote>();
  availableFootnotes.forEach(fn => {
    footnoteMap.set(fn.reference_number, fn);
  });

  // Regex matching [^1], [^12], [note:1], ((1))
  const footnoteRegex = /\[\^(\d+)\]|\[note:\s*(\d+)\]|\(\((\d+)\)\)/g;

  const tokens: InlineFootnoteToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = footnoteRegex.exec(paragraph)) !== null) {
    // Add preceding text
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        text: paragraph.substring(lastIndex, match.index),
      });
    }

    const refNumStr = match[1] || match[2] || match[3];
    const refNum = parseInt(refNumStr, 10);
    const resolvedFootnote = footnoteMap.get(refNum) || {
      id: `fn-auto-${refNum}`,
      reference_number: refNum,
      contenu: `Note de référence #${refNum}`,
    };

    tokens.push({
      type: 'footnote',
      refNumber: refNum,
      footnote: resolvedFootnote,
    });

    lastIndex = footnoteRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < paragraph.length) {
    tokens.push({
      type: 'text',
      text: paragraph.substring(lastIndex),
    });
  }

  return tokens;
}

/**
 * Strips footnote markers [^1] from text (useful for clean plain text exports / TTS / clean previews)
 */
export function stripFootnoteMarkers(text: string): string {
  if (!text) return '';
  return text.replace(/\[\^(\d+)\]|\[note:\s*(\d+)\]|\(\((\d+)\)\)/g, '');
}
