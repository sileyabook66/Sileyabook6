import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Quote, 
  Share2, 
  Palette, 
  Maximize2, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Highlighter, 
  BookOpen, 
  Feather, 
  Layers, 
  Eye, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Ebook } from '../types';

export type QuoteThemeId = 'velin' | 'encre_nuit' | 'sienne' | 'lin_sable' | 'emeraude';
export type QuoteAspectRatio = '1:1' | '9:16' | '16:9';

interface QuoteThemeConfig {
  id: QuoteThemeId;
  name: string;
  badge: string;
  bgColor: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  highlightBg: string;
  highlightTextColor: string;
  borderColor: string;
  metaColor: string;
  quoteMarkColor: string;
  textureType: 'parchment' | 'dark_grain' | 'terracotta' | 'linen' | 'emerald_leather';
}

const THEMES: Record<QuoteThemeId, QuoteThemeConfig> = {
  velin: {
    id: 'velin',
    name: 'Bleu Azur & Céleste',
    badge: 'Azur Parchemin',
    bgColor: '#F0F7FF',
    bgGradient: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #DBEAFE 100%)',
    textColor: '#0F2942',
    accentColor: '#1D4ED8',
    highlightBg: 'rgba(59, 130, 246, 0.25)',
    highlightTextColor: '#1E3A8A',
    borderColor: '#93C5FD',
    metaColor: '#3B82F6',
    quoteMarkColor: 'rgba(29, 78, 216, 0.15)',
    textureType: 'parchment',
  },
  encre_nuit: {
    id: 'encre_nuit',
    name: 'Bleu Nuit Stellaire',
    badge: 'Obsidienne & Cyan',
    bgColor: '#080E1C',
    bgGradient: 'linear-gradient(135deg, #0F172A 0%, #080E1C 50%, #030712 100%)',
    textColor: '#F8FAFC',
    accentColor: '#93C5FD',
    highlightBg: 'rgba(59, 130, 246, 0.35)',
    highlightTextColor: '#EFF6FF',
    borderColor: '#1E3A8A',
    metaColor: '#60A5FA',
    quoteMarkColor: 'rgba(147, 197, 253, 0.15)',
    textureType: 'dark_grain',
  },
  sienne: {
    id: 'sienne',
    name: 'Bleu Roi & Or Impérial',
    badge: 'Royal & Or',
    bgColor: '#0B1938',
    bgGradient: 'linear-gradient(135deg, #172554 0%, #0B1938 50%, #050B18 100%)',
    textColor: '#FAF7F0',
    accentColor: '#FDE047',
    highlightBg: 'rgba(253, 224, 71, 0.28)',
    highlightTextColor: '#FFFFFF',
    borderColor: '#1E40AF',
    metaColor: '#93C5FD',
    quoteMarkColor: 'rgba(253, 224, 71, 0.18)',
    textureType: 'terracotta',
  },
  lin_sable: {
    id: 'lin_sable',
    name: 'Bleu Lin & Cobalt',
    badge: 'Cobalt Minimal',
    bgColor: '#F1F6FD',
    bgGradient: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 60%, #CBD5E1 100%)',
    textColor: '#0F172A',
    accentColor: '#2563EB',
    highlightBg: 'rgba(37, 99, 235, 0.25)',
    highlightTextColor: '#0F172A',
    borderColor: '#94A3B8',
    metaColor: '#475569',
    quoteMarkColor: 'rgba(37, 99, 235, 0.15)',
    textureType: 'linen',
  },
  emeraude: {
    id: 'emeraude',
    name: 'Bleu Océan Profond',
    badge: 'Bleu Abyssal',
    bgColor: '#081F38',
    bgGradient: 'linear-gradient(135deg, #0C2B4E 0%, #081F38 50%, #040F1D 100%)',
    textColor: '#F0F9FF',
    accentColor: '#38BDF8',
    highlightBg: 'rgba(56, 189, 248, 0.25)',
    highlightTextColor: '#FFFFFF',
    borderColor: '#0369A1',
    metaColor: '#7DD3FC',
    quoteMarkColor: 'rgba(56, 189, 248, 0.18)',
    textureType: 'emerald_leather',
  },
};

interface SocialQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  initialQuoteText?: string;
  sourceChapterTitle?: string;
  defaultAuthor?: string;
}

export const SocialQuoteModal: React.FC<SocialQuoteModalProps> = ({
  isOpen,
  onClose,
  ebook,
  initialQuoteText = '',
  sourceChapterTitle = '',
  defaultAuthor = 'Auteur du Manuscrit',
}) => {
  // Quote Content State
  const [quoteText, setQuoteText] = useState(initialQuoteText);
  const [highlightPhrase, setHighlightPhrase] = useState('');
  const [authorName, setAuthorName] = useState(defaultAuthor);
  const [bookTitle, setBookTitle] = useState(ebook.titre);
  const [chapterRef, setChapterRef] = useState(sourceChapterTitle);
  const [showWatermark, setShowWatermark] = useState(true);

  // Styling & Layout State
  const [selectedTheme, setSelectedTheme] = useState<QuoteThemeId>('velin');
  const [aspectRatio, setAspectRatio] = useState<QuoteAspectRatio>('1:1');
  const [fontSize, setFontSize] = useState<number>(28);
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
  const [isItalic, setIsItalic] = useState<boolean>(true);
  const [opticalSize, setOpticalSize] = useState<number>(72); // Fraunces optical size (9-144)
  const [softness, setSoftness] = useState<number>(50); // Fraunces SOFT axis (0-100)

  // Status state
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial quote text when modal opens with new selection
  useEffect(() => {
    if (initialQuoteText) {
      setQuoteText(initialQuoteText.trim());
      // Try to auto-select a punchy segment for the highlight
      const sentences = initialQuoteText.split(/[.!?]/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        // Take first 3-5 words of the first punchline
        const words = sentences[0].trim().split(/\s+/);
        if (words.length >= 3) {
          setHighlightPhrase(words.slice(0, Math.min(words.length, 5)).join(' '));
        }
      }
    } else if (ebook.contenu.introduction) {
      // Default fallback from introduction
      const introWords = ebook.contenu.introduction.slice(0, 180);
      setQuoteText(introWords);
    }
    if (sourceChapterTitle) {
      setChapterRef(sourceChapterTitle);
    }
    if (ebook.titre) {
      setBookTitle(ebook.titre);
    }
  }, [initialQuoteText, sourceChapterTitle, ebook]);

  // Extract preset quotes from the ebook to let users quickly pick punchlines
  const availablePresetQuotes = React.useMemo(() => {
    const list: Array<{ text: string; source: string; author?: string }> = [];

    // Callouts from sections
    ebook.contenu.chapitres?.forEach((chap) => {
      chap.sections?.forEach((sec) => {
        if (sec.callout?.content) {
          list.push({
            text: sec.callout.content,
            source: `Chapitre ${chap.numero} — ${sec.titre}`,
            author: sec.callout.author,
          });
        }
      });
    });

    // Description / Subtitle
    if (ebook.description) {
      list.push({
        text: ebook.description,
        source: 'Note Éditoriale & Manifeste',
      });
    }

    // Preface or Conclusion if present
    if (ebook.contenu.preface) {
      list.push({
        text: ebook.contenu.preface.slice(0, 220),
        source: 'Préface du Manuscrit',
      });
    }

    return list.slice(0, 8);
  }, [ebook]);

  const currentTheme = THEMES[selectedTheme];

  // Canvas Drawing Routine (Crisp 2x Retina rendering)
  const drawCardToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions based on Aspect Ratio
    let width = 1080;
    let height = 1080;

    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === '16:9') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background & Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTheme === 'velin') {
      bgGrad.addColorStop(0, '#FAF7F0');
      bgGrad.addColorStop(0.5, '#F4EDE0');
      bgGrad.addColorStop(1, '#EAE0CD');
    } else if (selectedTheme === 'encre_nuit') {
      bgGrad.addColorStop(0, '#1B1917');
      bgGrad.addColorStop(0.5, '#121110');
      bgGrad.addColorStop(1, '#0A0A09');
    } else if (selectedTheme === 'sienne') {
      bgGrad.addColorStop(0, '#481D13');
      bgGrad.addColorStop(0.5, '#35130B');
      bgGrad.addColorStop(1, '#200B06');
    } else if (selectedTheme === 'lin_sable') {
      bgGrad.addColorStop(0, '#F8F5EE');
      bgGrad.addColorStop(0.6, '#EDE5D6');
      bgGrad.addColorStop(1, '#E1D6C2');
    } else {
      bgGrad.addColorStop(0, '#16332A');
      bgGrad.addColorStop(0.5, '#0E221C');
      bgGrad.addColorStop(1, '#081511');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Procedural Paper / Texture Grain & Vignette
    // Fine noise pattern simulation
    ctx.save();
    ctx.fillStyle = selectedTheme === 'velin' || selectedTheme === 'lin_sable' ? 'rgba(0,0,0,0.018)' : 'rgba(255,255,255,0.015)';
    for (let x = 0; x < width; x += 18) {
      for (let y = 0; y < height; y += 18) {
        if ((x + y) % 3 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    ctx.restore();

    // Subtle Radial Vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.25,
      width / 2, height / 2, width * 0.75
    );
    if (selectedTheme === 'velin' || selectedTheme === 'lin_sable') {
      vignette.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      vignette.addColorStop(1, 'rgba(70, 50, 30, 0.08)');
    } else {
      vignette.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    }
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 3. Elegant Double Border Frame & Deckled corner marks
    const margin = aspectRatio === '9:16' ? 70 : 60;
    ctx.strokeStyle = currentTheme.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner hairline frame
    ctx.strokeStyle = selectedTheme === 'velin' || selectedTheme === 'lin_sable' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);

    // Decorative corner flourishes
    const cornerSize = 16;
    ctx.fillStyle = currentTheme.accentColor;
    // Top-left
    ctx.fillRect(margin + 6, margin + 6, cornerSize, 2);
    ctx.fillRect(margin + 6, margin + 6, 2, cornerSize);
    // Top-right
    ctx.fillRect(width - margin - 6 - cornerSize, margin + 6, cornerSize, 2);
    ctx.fillRect(width - margin - 8, margin + 6, 2, cornerSize);
    // Bottom-left
    ctx.fillRect(margin + 6, height - margin - 8, cornerSize, 2);
    ctx.fillRect(margin + 6, height - margin - 6 - cornerSize, 2, cornerSize);
    // Bottom-right
    ctx.fillRect(width - margin - 6 - cornerSize, height - margin - 8, cornerSize, 2);
    ctx.fillRect(width - margin - 8, height - margin - 6 - cornerSize, 2, cornerSize);

    // 4. Giant Watermark Quotation Mark in Background
    ctx.save();
    ctx.font = `italic 240px "Fraunces", "Newsreader", serif`;
    ctx.fillStyle = currentTheme.quoteMarkColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('“', margin + 30, margin + 30);
    ctx.restore();

    // 5. Header Header Tag (Category / Book Title)
    ctx.save();
    ctx.font = `600 18px "IBM Plex Mono", "Cinzel", monospace`;
    ctx.fillStyle = currentTheme.accentColor;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    const topTag = (chapterRef || ebook.titre || 'EXTRAIT DU MANUSCRIT').toUpperCase();
    ctx.fillText(topTag.slice(0, 48), width / 2, margin + 50);

    // Small divider
    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 30, margin + 66);
    ctx.lineTo(width / 2 + 30, margin + 66);
    ctx.stroke();
    ctx.restore();

    // 6. Draw Main Quote with Fraunces & Highlight support
    ctx.save();
    const dynamicFontSize = aspectRatio === '9:16' ? fontSize * 1.15 : fontSize;
    const fontStyle = isItalic ? 'italic' : 'normal';
    ctx.font = `${fontStyle} 600 ${dynamicFontSize}px "Fraunces", "Newsreader", Georgia, serif`;
    ctx.fillStyle = currentTheme.textColor;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const maxTextWidth = width - (margin + 60) * 2;
    const lineHeight = dynamicFontSize * 1.55;

    // Word wrap calculation
    const rawWords = quoteText.split(/\s+/).filter(w => w.length > 0);
    const lines: string[] = [];
    let currentLine = '';

    for (let n = 0; n < rawWords.length; n++) {
      const testLine = currentLine ? `${currentLine} ${rawWords[n]}` : rawWords[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        lines.push(currentLine);
        currentLine = rawWords[n];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Determine vertical center area
    const totalQuoteHeight = lines.length * lineHeight;
    const contentCenterY = height / 2 - 15;
    let startY = contentCenterY - totalQuoteHeight / 2 + lineHeight / 2;

    // Check if startY is too high or low
    if (startY < margin + 120) {
      startY = margin + 120;
    }

    // Normalize highlight phrase for matching
    const cleanHighlight = highlightPhrase.trim().toLowerCase();

    // Render lines with highlight detection
    lines.forEach((line, lineIdx) => {
      const lineY = startY + lineIdx * lineHeight;
      let lineX = width / 2;
      if (textAlign === 'left') {
        lineX = margin + 60;
      } else if (textAlign === 'right') {
        lineX = width - (margin + 60);
      }

      // If this line contains the highlight phrase, draw a highlighter brush rectangle behind it
      if (cleanHighlight && line.toLowerCase().includes(cleanHighlight)) {
        ctx.save();
        const lineMetrics = ctx.measureText(line);
        const hlWidth = Math.min(lineMetrics.width + 24, maxTextWidth + 20);
        let hlX = lineX - hlWidth / 2;
        if (textAlign === 'left') hlX = lineX - 8;
        if (textAlign === 'right') hlX = lineX - hlWidth + 8;

        // Draw rounded highlighter pill
        ctx.fillStyle = currentTheme.highlightBg;
        const hlHeight = dynamicFontSize * 1.25;
        const radius = 6;
        ctx.beginPath();
        ctx.roundRect(hlX, lineY - hlHeight / 2, hlWidth, hlHeight, radius);
        ctx.fill();

        // Highlighter top/bottom accent shimmer
        ctx.strokeStyle = currentTheme.accentColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Quote Text Line
      ctx.fillText(line, lineX, lineY);
    });

    ctx.restore();

    // 7. Footer: Author Name, Book Title & Watermark
    ctx.save();
    const footerBottomY = height - margin - 45;

    // Author Name in elegant Fraunces / Serif
    ctx.font = `600 24px "Fraunces", "Newsreader", serif`;
    ctx.fillStyle = currentTheme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(`— ${authorName} —`, width / 2, footerBottomY - 34);

    // Book Title Subline
    ctx.font = `italic 16px "Newsreader", serif`;
    ctx.fillStyle = currentTheme.metaColor;
    ctx.fillText(`Extrait de « ${bookTitle} »`, width / 2, footerBottomY - 8);

    // Watermark / Brand stamp
    if (showWatermark) {
      ctx.font = `500 12px "IBM Plex Mono", monospace`;
      ctx.fillStyle = selectedTheme === 'velin' || selectedTheme === 'lin_sable' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('STUDIO MANUSCRIT • ÉDITION D\'ART', width / 2, footerBottomY + 18);
    }

    ctx.restore();

  }, [
    quoteText,
    highlightPhrase,
    authorName,
    bookTitle,
    chapterRef,
    showWatermark,
    selectedTheme,
    aspectRatio,
    fontSize,
    textAlign,
    isItalic,
    currentTheme,
    ebook.titre
  ]);

  // Redraw canvas whenever inputs change
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow modal animation and custom font loading
      const t = setTimeout(() => {
        drawCardToCanvas();
      }, 80);
      return () => clearTimeout(t);
    }
  }, [isOpen, drawCardToCanvas]);

  // Export to PNG Download
  const handleDownloadPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      drawCardToCanvas();

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const cleanTitle = (bookTitle || 'manuscrit').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `citation_${cleanTitle}_${aspectRatio.replace(':', 'x')}_${selectedTheme}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        setIsExporting(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }, 'image/png');
    } catch (err) {
      console.error('Erreur lors du téléchargement PNG:', err);
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      drawCardToCanvas();

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }

        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
          } else {
            // Fallback to downloading
            handleDownloadPng();
          }
        } catch (copyErr) {
          console.warn('Clipboard write failed, downloading image instead:', copyErr);
          handleDownloadPng();
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erreur de copie image:', err);
      setIsExporting(false);
    }
  };

  // Web Share API support
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `citation_${ebook.titre.slice(0, 20)}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Citation de « ${ebook.titre} »`,
            text: `« ${quoteText} » — ${authorName}`,
            files: [file],
          });
        } else {
          handleCopyImage();
        }
      });
    } catch {
      handleCopyImage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 text-white">
      <div className="bg-[#132238] border border-[#2E4374] rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524] shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1B2A4A] border border-[#2E4374] text-white flex items-center justify-center shadow-xs">
              <Quote className="w-5 h-5 text-[#60A5FA]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display-title text-base sm:text-lg font-bold text-white">
                  Export Citation Réseaux Sociaux
                </h3>
                <span className="font-ibm-mono text-[10px] px-2 py-0.5 rounded-full bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] font-semibold">
                  Typo Fraunces
                </span>
              </div>
              <p className="text-xs text-[#93C5FD] font-serif-book mt-0.5">
                Créez une carte visuelle raffinée avec mise en surbrillance, fond texturé et typographie d'art.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#93C5FD] hover:text-white hover:bg-[#1B2A4A] transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 columns: Controls + Live Canvas Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#2E4374]">
          
          {/* LEFT: Controls & Text Editor (Scrollable) */}
          <div className="lg:col-span-6 p-5 sm:p-6 overflow-y-auto space-y-6 bg-[#132238]">
            
            {/* Quick preset quote picker if available */}
            {availablePresetQuotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                    <span>Citations Clés du Livre ({availablePresetQuotes.length})</span>
                  </label>
                  <span className="text-[11px] text-[#93C5FD] font-serif-book italic">Sélection 1-clic</span>
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {availablePresetQuotes.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuoteText(item.text);
                        setChapterRef(item.source);
                        if (item.author) setAuthorName(item.author);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0B1524] border border-[#2E4374] hover:border-[#60A5FA] text-white text-xs shrink-0 max-w-[200px] truncate text-left transition-all hover:shadow-xs"
                      title={item.text}
                    >
                      <span className="font-serif-book italic block truncate">"{item.text}"</span>
                      <span className="font-mono text-[9px] text-[#93C5FD] block truncate">{item.source}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quote Text Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#BFDBFE]">
                  Texte du Passage / Citation
                </label>
                <span className="text-[11px] font-mono text-[#93C5FD]">
                  {quoteText.length} caractères
                </span>
              </div>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                rows={4}
                placeholder="Saisissez ou collez le passage marquant..."
                className="w-full p-3.5 bg-[#0B1524] border border-[#2E4374] rounded-2xl text-sm font-fraunces text-white focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] outline-hidden leading-relaxed shadow-xs resize-y"
              />
            </div>

            {/* Citation en Surbrillance (Highlighter Marker) */}
            <div className="space-y-2 bg-[#0B1524] border border-[#2E4374] p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] flex items-center space-x-1.5">
                  <Highlighter className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Passage en Surbrillance (Effet Marqueur Bleu Saphir)</span>
                </label>
                {highlightPhrase && (
                  <button
                    onClick={() => setHighlightPhrase('')}
                    className="text-[10px] text-[#60A5FA] hover:underline font-semibold"
                  >
                    Effacer surbrillance
                  </button>
                )}
              </div>
              <input
                type="text"
                value={highlightPhrase}
                onChange={(e) => setHighlightPhrase(e.target.value)}
                placeholder="Ex: l'architecture cognitive, l'intelligence augmentée..."
                className="w-full p-2.5 bg-[#132238] border border-[#2E4374] rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-[#60A5FA] outline-hidden"
              />
              <p className="text-[11px] text-[#93C5FD] font-serif-book italic">
                Les mots correspondants seront illuminés par un bandeau de surlignage texturé bleu éditorial.
              </p>
            </div>

            {/* Theme / Texture Chooser */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#BFDBFE] flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Thème &amp; Texture du Fond</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(THEMES) as QuoteThemeId[]).map((themeKey) => {
                  const t = THEMES[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-2 border-[#60A5FA] shadow-xs'
                          : 'border-[#2E4374] hover:border-[#60A5FA]/60 bg-[#0B1524]'
                      }`}
                      style={{ background: t.bgGradient }}
                    >
                      <div className="space-y-1 relative z-10">
                        <span 
                          className="font-ibm-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm inline-block"
                          style={{ 
                            background: t.accentColor, 
                            color: t.id === 'velin' || t.id === 'lin_sable' ? '#FAF7F0' : '#1A1815' 
                          }}
                        >
                          {t.badge}
                        </span>
                        <h4 
                          className="font-fraunces text-xs font-bold block truncate"
                          style={{ color: t.textColor }}
                        >
                          {t.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Network Ratio Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#BFDBFE] flex items-center space-x-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Format Réseau Social</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: '1:1' as QuoteAspectRatio, label: 'Carré (1:1)', sub: 'Insta / LinkedIn' },
                  { ratio: '9:16' as QuoteAspectRatio, label: 'Story (9:16)', sub: 'Reels / TikTok' },
                  { ratio: '16:9' as QuoteAspectRatio, label: 'Bannière (16:9)', sub: 'X / Twitter feed' },
                ].map((item) => (
                  <button
                    key={item.ratio}
                    onClick={() => setAspectRatio(item.ratio)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aspectRatio === item.ratio
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs font-bold'
                        : 'bg-[#0B1524] text-[#93C5FD] border-[#2E4374] hover:bg-[#182C48]'
                    }`}
                  >
                    <span className="font-ibm-mono text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] opacity-75 block">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typographic Adjustments */}
            <div className="space-y-3 p-4 bg-[#0B1524] border border-[#2E4374] rounded-2xl">
              <label className="text-xs font-bold uppercase tracking-wider text-[#BFDBFE] flex items-center space-x-1.5">
                <Type className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Mise en Forme Typographique (Fraunces)</span>
              </label>

              {/* Align & Style toggles */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center space-x-1 bg-[#132238] p-1 rounded-xl border border-[#2E4374]">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      textAlign === 'left' ? 'bg-[#2563EB] text-white' : 'text-[#93C5FD] hover:text-white'
                    }`}
                    title="Aligner à gauche"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      textAlign === 'center' ? 'bg-[#2563EB] text-white' : 'text-[#93C5FD] hover:text-white'
                    }`}
                    title="Centrer"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      textAlign === 'right' ? 'bg-[#2563EB] text-white' : 'text-[#93C5FD] hover:text-white'
                    }`}
                    title="Aligner à droite"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isItalic
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#132238] text-[#93C5FD] border-[#2E4374]'
                    }`}
                  >
                    <span className="italic font-fraunces">Italique Auteur</span>
                  </button>

                  <button
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      showWatermark
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#132238] text-[#93C5FD] border-[#2E4374]'
                    }`}
                  >
                    <span>Filigrane Studio</span>
                  </button>
                </div>
              </div>

              {/* Font size slider */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-[#93C5FD]">
                  <span>Taille de corps de texte</span>
                  <span className="font-ibm-mono font-bold text-white">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={44}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#60A5FA] cursor-pointer"
                />
              </div>
            </div>

            {/* Author & Context Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]">
                  Nom de l'Auteur
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-2 bg-[#0B1524] border border-[#2E4374] rounded-xl text-xs font-medium text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]">
                  Titre / Référence Source
                </label>
                <input
                  type="text"
                  value={chapterRef}
                  onChange={(e) => setChapterRef(e.target.value)}
                  placeholder="Ex: Chapitre 1 — Écriture Augmentée"
                  className="w-full p-2 bg-[#0B1524] border border-[#2E4374] rounded-xl text-xs font-medium text-white"
                />
              </div>
            </div>

          </div>

          {/* RIGHT: Live Visual Card Preview + Export Actions */}
          <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col justify-between items-center bg-[#0B1524] overflow-y-auto space-y-6">
            
            <div className="w-full flex items-center justify-between text-xs text-[#93C5FD]">
              <span className="font-bold uppercase tracking-wider flex items-center space-x-1 text-[#60A5FA]">
                <Eye className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Rendu Haute Définition (Fraunces &amp; Textures)</span>
              </span>
              <span className="font-ibm-mono text-[11px] bg-[#132238] px-2 py-0.5 rounded-md border border-[#2E4374] text-[#60A5FA]">
                {aspectRatio === '1:1' ? '1080 × 1080 px' : aspectRatio === '9:16' ? '1080 × 1920 px' : '1200 × 675 px'}
              </span>
            </div>

            {/* Card Preview Container */}
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <div 
                className="max-w-full rounded-2xl shadow-2xl overflow-hidden border border-[#2E4374] transition-all duration-300 transform hover:scale-[1.01]"
                style={{
                  maxHeight: aspectRatio === '9:16' ? '480px' : '420px',
                  aspectRatio: aspectRatio === '1:1' ? '1/1' : aspectRatio === '9:16' ? '9/16' : '16/9',
                }}
              >
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                />
              </div>
            </div>

            {/* Export & Action Buttons Bar */}
            <div className="w-full space-y-3 bg-[#132238] p-4 rounded-2xl border border-[#2E4374] shadow-xs">
              
              <div className="flex items-center justify-between text-xs text-[#93C5FD] pb-1">
                <span>Exporter vers vos canaux :</span>
                <div className="flex items-center space-x-2 text-[#60A5FA]">
                  <Instagram className="w-4 h-4" />
                  <Twitter className="w-4 h-4" />
                  <Linkedin className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Image PNG Téléchargée !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Télécharger Carte PNG</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="w-full py-3 bg-[#1B2A4A] hover:bg-[#25395F] text-white rounded-xl text-xs font-bold border border-[#2E4374] shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Copiée dans le Presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#60A5FA]" />
                      <span>Copier l'Image</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleShare}
                className="w-full py-2 bg-[#0B1524] hover:bg-[#182C48] text-white border border-[#2E4374] rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Partager via l'application mobile / OS</span>
              </button>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2E4374] bg-[#0B1524] flex items-center justify-between text-xs text-[#93C5FD] shrink-0">
          <div className="flex items-center space-x-2 font-ibm-mono text-[11px] text-white">
            <Feather className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Studio Manuscrit • Export Réseaux Sociaux</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
