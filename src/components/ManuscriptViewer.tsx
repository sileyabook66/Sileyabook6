import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Layers, 
  Code, 
  Download, 
  Check, 
  ArrowLeft, 
  Copy, 
  Quote,
  PenTool,
  Bookmark,
  Printer, 
  Share2, 
  Clock, 
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sliders,
  Feather,
  FileDown,
  Loader2,
  Eye,
  BookMarked,
  Image as ImageIcon,
  CloudUpload,
  Tablet,
  ExternalLink,
  ChevronDown,
  BookOpenCheck,
  Compass,
  ShoppingBag,
  History,
  ShieldCheck,
  Split
} from 'lucide-react';
import { Ebook, Chapter, UserProfile } from '../types';
import { exportEbookToPdf, exportEbookToPdfAsync, exportCoverToPng, PdfExportOptions } from '../lib/pdfExporter';
import { exportEbookToEpub } from '../lib/epubExporter';
import { BookCoverPreview } from './BookCoverPreview';
import { TableOfContents } from './TableOfContents';
import { ExportCenterModal } from './ExportCenterModal';
import { EpubReaderModal } from './EpubReaderModal';
import { SocialQuoteModal } from './SocialQuoteModal';
import { FootnoteRenderer, FootnoteManagerModal } from './FootnoteRenderer';
import { EditorialMetadataModal } from './EditorialMetadataModal';
import { RevisionToolsModal } from './RevisionToolsModal';
import { KdpMarketingKitModal } from './KdpMarketingKitModal';
import { KdpFullCoverModal } from './KdpFullCoverModal';
import { SileyaCoverSelectorModal } from './SileyaCoverSelectorModal';
import { CalibratedChapterModal } from './CalibratedChapterModal';
import { countChapterWords, calculateChapterA5Pages, getChapterMetrics, splitChapterIfExceedsLimit } from '../lib/textStructure';
import { storage } from '../lib/storage';

interface ManuscriptViewerProps {
  ebook: Ebook;
  profile: UserProfile;
  onNewGeneration: () => void;
  onNavigateToDashboard?: () => void;
  onEbookUpdated?: (updatedEbook: Ebook) => void;
}

export const ManuscriptViewer: React.FC<ManuscriptViewerProps> = ({
  ebook: initialEbook,
  profile: userProfile,
  onNewGeneration,
  onNavigateToDashboard,
  onEbookUpdated
}) => {
  const [currentEbook, setCurrentEbook] = useState<Ebook>(initialEbook);
  const [activeTab, setActiveTab] = useState<'manuscript' | 'cover' | 'outline' | 'json'>('manuscript');
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);
  const [isExportingEpub, setIsExportingEpub] = useState(false);
  const [exportedEpub, setExportedEpub] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [exportedPng, setExportedPng] = useState(false);
  const [isExportCenterOpen, setIsExportCenterOpen] = useState(false);
  const [isEpubReaderOpen, setIsEpubReaderOpen] = useState(false);
  const [isEditorialModalOpen, setIsEditorialModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isMarketingKitOpen, setIsMarketingKitOpen] = useState(false);
  const [isKdpCoverOpen, setIsKdpCoverOpen] = useState(false);
  const [isStitchGalleryOpen, setIsStitchGalleryOpen] = useState(false);
  const [isCalibratedChapterModalOpen, setIsCalibratedChapterModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Social Quote Card Modal State
  const [isSocialQuoteModalOpen, setIsSocialQuoteModalOpen] = useState(false);
  const [quoteModalText, setQuoteModalText] = useState<string>('');
  const [quoteModalSource, setQuoteModalSource] = useState<string>('');

  // Footnote interaction mode: 'hover' vs 'click'
  const [footnoteDisplayMode, setFootnoteDisplayMode] = useState<'hover' | 'click'>('click');
  const [editingSectionFootnotes, setEditingSectionFootnotes] = useState<{
    chapterIdx: number;
    sectionIdx: number;
    sectionTitle: string;
    paragraphes: string[];
    footnotes: any[];
  } | null>(null);

  // Floating selection tooltip state
  const [floatingSelection, setFloatingSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Screen reader live announcement
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    setCurrentEbook(initialEbook);
  }, [initialEbook]);

  const chapters = currentEbook.contenu.chapitres || [];
  const safeChapterIdx = Math.min(Math.max(0, selectedChapterIdx), Math.max(0, chapters.length - 1));
  const currentChapter: Chapter | undefined = chapters[safeChapterIdx];

  useEffect(() => {
    if (selectedChapterIdx >= chapters.length && chapters.length > 0) {
      setSelectedChapterIdx(0);
    }
  }, [chapters.length, selectedChapterIdx]);

  // Keyboard navigation for reader and tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs or modals
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInputActive) return;

      // Close popups on Escape
      if (e.key === 'Escape') {
        if (isExportDropdownOpen) setIsExportDropdownOpen(false);
        if (floatingSelection) setFloatingSelection(null);
        return;
      }

      // Alt + 1..4 Tab Navigation
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('manuscript');
          setAnnouncement('Vue Manuscrit Littéraire activée');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('cover');
          setAnnouncement('Vue Couverture du Livre activée');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('outline');
          setAnnouncement('Vue Plan Éditorial activée');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('json');
          setAnnouncement('Vue JSON activée');
        }
        return;
      }

      // Chapter navigation (when manuscript tab is active)
      if (activeTab === 'manuscript' && chapters.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'j') {
          if (selectedChapterIdx < chapters.length - 1) {
            e.preventDefault();
            const nextIdx = selectedChapterIdx + 1;
            setSelectedChapterIdx(nextIdx);
            setAnnouncement(`Chapitre ${chapters[nextIdx]?.numero} : ${chapters[nextIdx]?.titre}`);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') {
          if (selectedChapterIdx > 0) {
            e.preventDefault();
            const prevIdx = selectedChapterIdx - 1;
            setSelectedChapterIdx(prevIdx);
            setAnnouncement(`Chapitre ${chapters[prevIdx]?.numero} : ${chapters[prevIdx]?.titre}`);
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          setSelectedChapterIdx(0);
          setAnnouncement(`Chapitre 1 : ${chapters[0]?.titre}`);
        } else if (e.key === 'End') {
          e.preventDefault();
          setSelectedChapterIdx(chapters.length - 1);
          setAnnouncement(`Chapitre ${chapters[chapters.length - 1]?.numero} : ${chapters[chapters.length - 1]?.titre}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedChapterIdx, chapters, isExportDropdownOpen, floatingSelection]);

  const handleEbookUpdate = (updatedEbook: Ebook) => {
    setCurrentEbook(updatedEbook);
    if (onEbookUpdated) {
      onEbookUpdated(updatedEbook);
    }
  };

  const handleChapterAdded = (newChapter: Chapter) => {
    const updatedChapters = [...chapters, newChapter];
    // Renumber sequentially
    updatedChapters.forEach((ch, idx) => {
      ch.numero = idx + 1;
      ch.id = `chap-${idx + 1}`;
      ch.metrics = getChapterMetrics(ch);
    });

    let totalWords = 0;
    updatedChapters.forEach((ch) => {
      totalWords += countChapterWords(ch);
    });
    if (currentEbook.contenu.introduction) {
      totalWords += currentEbook.contenu.introduction.split(/\s+/).filter(Boolean).length;
    }
    if (currentEbook.contenu.conclusion) {
      totalWords += currentEbook.contenu.conclusion.split(/\s+/).filter(Boolean).length;
    }

    const updatedEbook: Ebook = {
      ...currentEbook,
      plan: updatedChapters.map((ch) => ({
        numero: ch.numero,
        titre: ch.titre,
        description: ch.resume || `Chapitre ${ch.numero}`,
      })),
      contenu: {
        ...currentEbook.contenu,
        chapitres: updatedChapters,
        metadata: {
          ...currentEbook.contenu.metadata,
          mots_total: totalWords,
          pages_estimees: Math.max(1, Math.ceil(totalWords / 300)),
          temps_lecture_min: Math.max(1, Math.round(totalWords / 200)),
        },
      },
    };

    handleEbookUpdate(updatedEbook);
    storage.saveEbook(updatedEbook, userProfile.id).catch(console.error);
    setSelectedChapterIdx(updatedChapters.length - 1);
    setAnnouncement(`Nouveau chapitre calibré ajouté : ${newChapter.titre}`);
  };

  const handleSplitActiveChapter = () => {
    if (!currentChapter) return;
    const splitResults = splitChapterIfExceedsLimit(currentChapter);
    if (splitResults.length <= 1) return;

    const updatedChapters = [...chapters];
    updatedChapters.splice(selectedChapterIdx, 1, ...splitResults);

    // Renumber sequentially
    updatedChapters.forEach((ch, idx) => {
      ch.numero = idx + 1;
      ch.id = `chap-${idx + 1}`;
      ch.metrics = getChapterMetrics(ch);
    });

    const updatedEbook: Ebook = {
      ...currentEbook,
      plan: updatedChapters.map((ch) => ({
        numero: ch.numero,
        titre: ch.titre,
        description: ch.resume || `Chapitre ${ch.numero}`,
      })),
      contenu: {
        ...currentEbook.contenu,
        chapitres: updatedChapters,
      },
    };

    handleEbookUpdate(updatedEbook);
    storage.saveEbook(updatedEbook, userProfile.id).catch(console.error);
    setAnnouncement(`Le chapitre a été scindé en ${splitResults.length} parties pour respecter le plafond de 5 pages A5.`);
  };

  const handleExportPdf = async (options?: PdfExportOptions) => {
    try {
      setIsExportingPdf(true);
      await exportEbookToPdfAsync(currentEbook, {
        authorName: userProfile.name || 'Auteur du Manuscrit',
        coverTheme: (currentEbook.cover_theme as any) || 'velin',
        ...options,
      });
      setIsExportingPdf(false);
      setExportedPdf(true);
      setTimeout(() => setExportedPdf(false), 2500);
    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
      // Fallback to sync export if network issue
      try {
        exportEbookToPdf(currentEbook, {
          authorName: userProfile.name || 'Auteur du Manuscrit',
          coverTheme: (currentEbook.cover_theme as any) || 'velin',
          ...options,
        });
        setExportedPdf(true);
        setTimeout(() => setExportedPdf(false), 2500);
      } catch (fallbackErr) {
        console.error("Échec fallback export PDF:", fallbackErr);
      }
      setIsExportingPdf(false);
    }
  };

  const handleExportEpub = async () => {
    try {
      setIsExportingEpub(true);
      await exportEbookToEpub(currentEbook, {
        authorName: userProfile.name || 'Auteur du Manuscrit',
        coverTheme: (currentEbook.cover_theme as any) || 'velin',
      });
      setExportedEpub(true);
      setTimeout(() => setExportedEpub(false), 2500);
    } catch (err) {
      console.error("Erreur lors de l'export EPUB:", err);
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handleExportCoverPng = async () => {
    try {
      setIsExportingPng(true);
      const res = await exportCoverToPng(currentEbook, {
        authorName: userProfile.name || 'Auteur du Manuscrit',
        coverTheme: (currentEbook.cover_theme as any) || 'velin',
        format: 'portrait_hd',
      });
      res.download();
      setExportedPng(true);
      setTimeout(() => setExportedPng(false), 2500);
    } catch (err) {
      console.error("Erreur lors de l'export de couverture PNG:", err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentEbook.contenu, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${currentEbook.titre}\n\n*${currentEbook.sous_titre}*\n\n> ${currentEbook.description}\n\n---\n\n`;
    if (currentEbook.contenu.preface) {
      md += `## Préface\n\n${currentEbook.contenu.preface}\n\n---\n\n`;
    }
    md += `## Introduction\n\n${currentEbook.contenu.introduction}\n\n---\n\n`;

    chapters.forEach((chap) => {
      md += `## Chapitre ${chap.numero} : ${chap.titre}\n\n`;
      if (chap.objectifs?.length) {
        md += `### Objectifs :\n${chap.objectifs.map((o) => `- ${o}`).join('\n')}\n\n`;
      }
      chap.sections.forEach((sec) => {
        md += `### ${sec.titre}\n\n`;
        if (sec.sous_titre) md += `*${sec.sous_titre}*\n\n`;
        sec.paragraphes.forEach((p) => {
          md += `${p}\n\n`;
        });
      });
      if (chap.conclusion_chapitre) {
        md += `*Conclusion du chapitre :* ${chap.conclusion_chapitre}\n\n`;
      }
      md += `---\n\n`;
    });

    md += `## Conclusion\n\n${currentEbook.contenu.conclusion}\n\n`;
    if (currentEbook.contenu.epilogue) {
      md += `## Épilogue\n\n${currentEbook.contenu.epilogue}\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentEbook.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_manuscrit.md`;
    link.click();
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenSocialQuote = (text?: string, sourceTitle?: string) => {
    const rawText = text || (currentChapter?.sections[0]?.paragraphes[0]?.slice(0, 180) || currentEbook.description || '');
    setQuoteModalText(rawText);
    setQuoteModalSource(sourceTitle || (currentChapter ? `Chapitre ${currentChapter.numero} — ${currentChapter.titre}` : ''));
    setIsSocialQuoteModalOpen(true);
    setFloatingSelection(null);
  };

  const handleTextMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setFloatingSelection(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length >= 8) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Position popup centered just above the selection
        setFloatingSelection({
          text,
          x: Math.max(20, rect.left + rect.width / 2),
          y: Math.max(20, rect.top - 8),
        });
      } catch {
        setFloatingSelection(null);
      }
    } else {
      setFloatingSelection(null);
    }
  };

  const handleSaveSectionFootnotes = (
    chapterIdx: number,
    sectionIdx: number,
    updatedFootnotes: any[],
    updatedParagraphes?: string[]
  ) => {
    const updatedChapters = [...chapters];
    const targetChap = { ...updatedChapters[chapterIdx] };
    const targetSec = { ...targetChap.sections[sectionIdx] };

    targetSec.notes_de_bas_de_page = updatedFootnotes;
    if (updatedParagraphes) {
      targetSec.paragraphes = updatedParagraphes;
    }

    targetChap.sections[sectionIdx] = targetSec;
    updatedChapters[chapterIdx] = targetChap;

    const updatedEbook: Ebook = {
      ...currentEbook,
      contenu: {
        ...currentEbook.contenu,
        chapitres: updatedChapters,
      },
    };

    handleEbookUpdate(updatedEbook);
    storage.saveEbook(updatedEbook, userProfile.id).catch(console.error);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Accessible Skip Link */}
      <a 
        href="#main-manuscript-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#2E2820] focus:text-[#FAF7F0] focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-[#8C2D19] focus:outline-hidden text-xs font-bold"
      >
        Passer directement au contenu du chapitre
      </a>

      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      
      {/* Top Navigation & Status Bar */}
      <header className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-2 self-start lg:self-auto">
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              aria-label="Retourner au Tableau de Bord"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#EFE8D8] hover:bg-[#E2D9C5] text-xs font-semibold text-[#3B3020] transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tableau de Bord</span>
            </button>
          )}

          <button
            onClick={onNewGeneration}
            aria-label="Créer un nouveau livre ou manuscrit"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F8F5ED] hover:bg-[#EFE8D8] border border-[#DDD0B8] text-xs font-semibold text-[#4A4030] hover:text-[#1A1815] transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
          >
            <Feather className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
            <span>Nouveau Livre</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-y-2">
          {/* Status Badge */}
          <div 
            role="status"
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
              currentEbook.statut === 'published'
                ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                : 'bg-amber-100 text-amber-950 border-amber-400'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${currentEbook.statut === 'published' ? 'text-emerald-700' : 'text-amber-700'}`} aria-hidden="true" />
            <span>statut: <strong>'{currentEbook.statut}'</strong></span>
          </div>

          {/* Cloudinary Published URL Link if available */}
          {currentEbook.fichier_pdf_url && (
            <a
              href={currentEbook.fichier_pdf_url}
              target="_blank"
              rel="noreferrer"
              aria-label="Ouvrir le PDF hébergé sur Cloudinary (nouvelle fenêtre)"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:outline-hidden"
              title="Ouvrir le PDF hébergé sur Cloudinary"
            >
              <CloudUpload className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
              <span>PDF Cloudinary</span>
              <ExternalLink className="w-3 h-3 text-emerald-800" aria-hidden="true" />
            </a>
          )}

          {/* Editorial Pages & ISBN Button */}
          <button
            onClick={() => setIsEditorialModalOpen(true)}
            aria-label="Configurer les pages liminaires, mentions légales et ISBN"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#2E4374] border border-[#D5CAB7] rounded-lg text-xs font-semibold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
            title="Pages liminaires, copyright, dépôt légal, dédicace"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>Mentions &amp; ISBN</span>
          </button>

          {/* Revision & Typography Tools Button */}
          <button
            onClick={() => setIsRevisionModalOpen(true)}
            aria-label="Ouvrir l'atelier de révision, typographie et snapshots"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#4A3D2A] border border-[#D5CAB7] rounded-lg text-xs font-semibold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
            title="Recherche globale, espaces insécables et snapshots"
          >
            <PenTool className="w-3.5 h-3.5 text-[#1B2A4A]" aria-hidden="true" />
            <span>Révision &amp; Typo</span>
          </button>

          {/* KDP Marketing Kit Button */}
          <button
            onClick={() => setIsMarketingKitOpen(true)}
            aria-label="Ouvrir le kit marketing et simulateur Amazon KDP"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded-lg text-xs font-bold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-hidden"
            title="Fiche Amazon HTML, mots-clés et simulateur de redevances"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
            <span>Kit Amazon KDP</span>
          </button>

          {/* KDP Full Cover Template Button */}
          <button
            onClick={() => setIsKdpCoverOpen(true)}
            aria-label="Ouvrir le gabarit couverture complète KDP (Plat verso + tranche + recto)"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE] rounded-lg text-xs font-bold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-hidden"
            title="Gabarit couverture complète avec calcul d'épaisseur de tranche"
          >
            <Printer className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>Gabarit Broché KDP</span>
          </button>

          {/* Cover Preview Quick Tab Button */}
          <button
            onClick={() => {
              setActiveTab('cover');
              setAnnouncement('Vue Couverture du Livre activée');
            }}
            aria-label="Aperçu et personnalisation de la couverture"
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden ${
              activeTab === 'cover'
                ? 'bg-[#1B2A4A] text-[#FAF7F0] border-[#1B2A4A] shadow-xs'
                : 'bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#4A3D2A] border-[#D5CAB7]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
            <span>Aperçu Couverture</span>
          </button>

          {/* Stitch High-Definition Covers Gallery Button */}
          <button
            onClick={() => setIsStitchGalleryOpen(true)}
            aria-label="Sélectionner un visuel haute définition dans la galerie SileyaBook"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FDF4E7] hover:bg-[#FCEBD2] text-[#845415] border border-[#F3CCA0] rounded-lg text-xs font-bold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#C98A2C] focus-visible:outline-hidden"
            title="Choisir parmi les visuels artistiques haute définition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C98A2C]" aria-hidden="true" />
            <span>Galerie Sileya</span>
          </button>

          {/* Calibrated Chapter Generator Button */}
          <button
            onClick={() => setIsCalibratedChapterModalOpen(true)}
            aria-label="Générer un chapitre calibré selon la norme de 2000 mots et 5 pages A5"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF2E1] hover:bg-[#F3E6CD] text-[#8C2D19] border border-[#DFCBAA] rounded-lg text-xs font-bold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
            title="Générer un chapitre calibré (~2000 mots / ≤ 5 pages A5)"
          >
            <Feather className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
            <span>Chapitre Calibré (~2000 mots)</span>
          </button>


          {/* PNG Cover Export Button */}
          <button
            onClick={handleExportCoverPng}
            disabled={isExportingPng}
            aria-disabled={isExportingPng}
            aria-label="Télécharger la couverture au format PNG HD"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#3B3123] border border-[#D5CAB7] rounded-lg text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
          >
            {isExportingPng ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B2A4A]" aria-hidden="true" />
                <span>Export PNG...</span>
              </>
            ) : exportedPng ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span className="text-emerald-900 font-bold">PNG Téléchargé !</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-[#1B2A4A]" aria-hidden="true" />
                <span>Exporter Couverture PNG</span>
              </>
            )}
          </button>

          {/* Liseuse EPUB 3 (epub.js Simulator) */}
          <button
            onClick={() => setIsEpubReaderOpen(true)}
            aria-label="Ouvrir la liseuse numérique EPUB intégrée"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF3E6] hover:bg-[#F2E5CE] text-[#8C2D19] border border-[#DFC8A4] rounded-lg text-xs font-bold shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
          >
            <BookOpenCheck className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
            <span>Liseuse EPUB</span>
            <span className="text-[10px] font-mono bg-[#8C2D19] text-[#FAF7F0] px-1.5 py-0.2 rounded-full font-bold">
              epubjs
            </span>
          </button>

          {/* Quick EPUB Direct Export Button */}
          <button
            onClick={handleExportEpub}
            disabled={isExportingEpub}
            aria-disabled={isExportingEpub}
            aria-label="Télécharger le livre au format EPUB pour liseuses"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F6EFE0] hover:bg-[#ECE1CC] text-[#3B3020] border border-[#D5C6AC] rounded-lg text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
          >
            {isExportingEpub ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C2D19]" aria-hidden="true" />
                <span>Création EPUB...</span>
              </>
            ) : exportedEpub ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span className="text-emerald-900 font-bold">EPUB Téléchargé !</span>
              </>
            ) : (
              <>
                <Tablet className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
                <span>Exporter en EPUB</span>
              </>
            )}
          </button>

          {/* PDF Export Button */}
          <button
            onClick={() => handleExportPdf()}
            disabled={isExportingPdf}
            aria-disabled={isExportingPdf}
            aria-label="Télécharger le livre complet au format PDF A4"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1B2A4A] hover:bg-[#2E4374] text-[#FAF7F0] border border-[#1B2A4A] rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#93C5FD]" aria-hidden="true" />
                <span>Composition PDF...</span>
              </>
            ) : exportedPdf ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-300 font-bold">PDF Téléchargé !</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
                <span>Exporter en PDF</span>
              </>
            )}
          </button>

          {/* Unified Export Menu Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              aria-haspopup="menu"
              aria-expanded={isExportDropdownOpen}
              aria-controls="export-menu-dropdown"
              aria-label="Ouvrir le menu de tous les formats d'exportation"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#2E4374] hover:bg-[#1B2A4A] text-[#FAF7F0] rounded-lg text-xs font-bold shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
            >
              <Download className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
              <span>Menu d'Export</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#93C5FD] transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isExportDropdownOpen && (
              <div 
                id="export-menu-dropdown"
                role="menu"
                aria-label="Menu d'exportation"
                className="absolute right-0 mt-2 w-72 bg-[#FAF7F0] border border-[#D5C6AC] rounded-2xl shadow-2xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs"
              >
                {/* Header */}
                <div className="px-3 py-2 border-b border-[#E8DFC8]">
                  <span className="font-display-title font-bold text-[#1C1A17] block">
                    Formats d'Exportation
                  </span>
                  <span className="text-[10px] font-serif text-[#544A39] italic">
                    Conformes aux standards d'édition numérique
                  </span>
                </div>

                {/* Option: EPUB 3.0 Liseuses (epub.js) */}
                <div className="p-2 bg-[#EFF5FC] rounded-xl space-y-1.5 border border-[#BFDBFE]" role="none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-[#1B2A4A]">
                      <Tablet className="w-4 h-4" aria-hidden="true" />
                      <span>EPUB 3.0 (Liseuses)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#1B2A4A] text-white px-1.5 py-0.2 rounded-full font-bold">
                      Kindle / Kobo
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4A4030] font-serif-book">
                    Mise en page fluide reflowable, Dublin Core et table des matières EPUB 3.2.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      role="menuitem"
                      onClick={() => {
                        handleExportEpub();
                        setIsExportDropdownOpen(false);
                      }}
                      className="py-1 px-2 bg-[#1B2A4A] hover:bg-[#2E4374] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
                    >
                      <Download className="w-3 h-3 text-[#93C5FD]" aria-hidden="true" />
                      <span>Télécharger</span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsEpubReaderOpen(true);
                        setIsExportDropdownOpen(false);
                      }}
                      className="py-1 px-2 bg-white hover:bg-[#EBF3FB] text-[#1B2A4A] border border-[#BFDBFE] rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden"
                    >
                      <BookOpenCheck className="w-3 h-3" aria-hidden="true" />
                      <span>Liseuse</span>
                    </button>
                  </div>
                </div>

                {/* Option: Document PDF */}
                <button
                  role="menuitem"
                  onClick={() => {
                    handleExportPdf();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#EDE3CF] text-[#2E2820] flex items-center justify-between transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileDown className="w-4 h-4 text-[#2E2820]" aria-hidden="true" />
                    <div>
                      <span className="font-semibold block text-[#1C1A17]">Document PDF A4</span>
                      <span className="text-[10px] text-[#544A39]">jsPDF • Couverture & Sommaire inclus</span>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#544A39]" aria-hidden="true" />
                </button>

                {/* Option: Couverture PNG */}
                <button
                  role="menuitem"
                  onClick={() => {
                    handleExportCoverPng();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#EDE3CF] text-[#2E2820] flex items-center justify-between transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
                >
                  <div className="flex items-center space-x-2.5">
                    <ImageIcon className="w-4 h-4 text-[#8C2D19]" aria-hidden="true" />
                    <div>
                      <span className="font-semibold block text-[#1C1A17]">Couverture PNG HD</span>
                      <span className="text-[10px] text-[#544A39]">1200x1800 px • Pour KDP & Réseaux</span>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#544A39]" aria-hidden="true" />
                </button>

                {/* Option: Centre d'Export & Cloudinary */}
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsExportCenterOpen(true);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#EDE3CF] text-[#8C2D19] flex items-center justify-between transition-colors border-t border-[#E8DFC8] pt-2 focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
                >
                  <div className="flex items-center space-x-2.5">
                    <CloudUpload className="w-4 h-4 text-[#8C2D19]" aria-hidden="true" />
                    <div>
                      <span className="font-bold block">Centre d'Export & Cloudinary</span>
                      <span className="text-[10px] text-[#544A39]">Aperçu live, reliures et hébergement</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Markdown & Print */}
          <button
            onClick={handleDownloadMarkdown}
            aria-label="Télécharger le fichier Markdown du manuscrit"
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#3B3020] border border-[#D5CAB7] rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
            title="Télécharger le fichier Markdown complet"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            aria-label="Imprimer le manuscrit ou ouvrir l'aperçu avant impression"
            className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#F2ECE0] hover:bg-[#E7DEC5] text-[#3B3020] border border-[#D5CAB7] rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
            title="Imprimer ou aperçu navigateur"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Imprimer</span>
          </button>
        </div>
      </header>

      {/* Book Cover Header Card */}
      <section className="bg-[#FCFBF7] border border-[#E5DECD] rounded-2xl p-6 sm:p-10 paper-shadow relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {currentEbook.source_type === 'texte_utilisateur' && (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F9ECE7] text-[#8C2D19] border border-[#E8C4BC] flex items-center space-x-1">
                <span>Texte Auteur (100% Verbatim)</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#EFE9DC] text-[#4A4032] border border-[#DDD3BF]">
              {currentEbook.contenu.metadata?.genre || "Essai & Guide"}
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#EFE9DC] text-[#4A4032] border border-[#DDD3BF]">
              {currentEbook.contenu.metadata?.pages_estimees || 15} pages de vélin
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#EFE9DC] text-[#4A4032] border border-[#DDD3BF]">
              ~{currentEbook.contenu.metadata?.temps_lecture_min || 20} min de lecture
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono text-[#544A39] bg-[#F7F4EC] border border-[#E5DECD]">
              ID: {currentEbook.id.slice(0, 8)}...
            </span>
          </div>

          <h1 className="font-display-title text-2xl sm:text-4xl font-bold text-[#1C1A17] tracking-tight leading-tight">
            {currentEbook.titre}
          </h1>

          <p className="font-serif-book italic text-lg sm:text-xl text-[#4E4435] leading-relaxed">
            {currentEbook.sous_titre}
          </p>

          <p className="text-sm text-[#42392E] leading-relaxed max-w-2xl border-l-2 border-[#D5CAB7] pl-4 italic font-serif-book">
            {currentEbook.description}
          </p>
        </div>

        {/* View Switcher Tabs (Accessible TabList) */}
        <div className="mt-8 pt-6 border-t border-[#E8DFCC] flex items-center justify-between flex-wrap gap-3">
          <div 
            role="tablist"
            aria-label="Modes d'affichage du livre"
            className="flex items-center space-x-2 bg-[#F1EAE0] p-1 rounded-xl border border-[#D8CEBA]"
          >
            <button
              id="tab-manuscript"
              role="tab"
              aria-selected={activeTab === 'manuscript'}
              aria-controls="panel-manuscript"
              tabIndex={activeTab === 'manuscript' ? 0 : -1}
              onClick={() => {
                setActiveTab('manuscript');
                setAnnouncement('Vue Manuscrit Littéraire activée');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden ${
                activeTab === 'manuscript'
                  ? 'bg-[#2E2820] text-[#FAF7F0] shadow-xs'
                  : 'text-[#4A4032] hover:text-[#1C1A17]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Manuscrit Littéraire (Alt+1)</span>
            </button>

            <button
              id="tab-cover"
              role="tab"
              aria-selected={activeTab === 'cover'}
              aria-controls="panel-cover"
              tabIndex={activeTab === 'cover' ? 0 : -1}
              onClick={() => {
                setActiveTab('cover');
                setAnnouncement('Vue Couverture du Livre activée');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden ${
                activeTab === 'cover'
                  ? 'bg-[#1B2A4A] text-[#FAF7F0] shadow-xs'
                  : 'text-[#4A4032] hover:text-[#1C1A17]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
              <span>Couverture (Alt+2)</span>
            </button>

            <button
              id="tab-outline"
              role="tab"
              aria-selected={activeTab === 'outline'}
              aria-controls="panel-outline"
              tabIndex={activeTab === 'outline' ? 0 : -1}
              onClick={() => {
                setActiveTab('outline');
                setAnnouncement('Vue Plan Éditorial activée');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden ${
                activeTab === 'outline'
                  ? 'bg-[#2E2820] text-[#FAF7F0] shadow-xs'
                  : 'text-[#4A4032] hover:text-[#1C1A17]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Plan ({currentEbook.plan.length}) (Alt+3)</span>
            </button>

            <button
              id="tab-json"
              role="tab"
              aria-selected={activeTab === 'json'}
              aria-controls="panel-json"
              tabIndex={activeTab === 'json' ? 0 : -1}
              onClick={() => {
                setActiveTab('json');
                setAnnouncement('Vue JSON activée');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden ${
                activeTab === 'json'
                  ? 'bg-[#2E2820] text-[#FAF7F0] shadow-xs'
                  : 'text-[#4A4032] hover:text-[#1C1A17]'
              }`}
            >
              <Code className="w-3.5 h-3.5" aria-hidden="true" />
              <span>JSON (Alt+4)</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExportCenterOpen(true)}
              aria-label="Ouvrir le centre d'aperçu PDF et d'exportation"
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF4E8] hover:bg-[#F2E8D5] text-[#332B20] border border-[#DDD0B8] rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden"
            >
              <FileDown className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
              <span>Aperçu PDF & Export</span>
            </button>
            <div className="text-xs text-[#544A39] font-mono font-medium">
              {chapters.length} chapitres rédigés
            </div>
          </div>
        </div>
      </section>

      {/* TAB 1: MANUSCRIT LITTÉRAIRE */}
      {activeTab === 'manuscript' && (
        <div 
          id="panel-manuscript"
          role="tabpanel"
          aria-labelledby="tab-manuscript"
          tabIndex={0}
          className="space-y-6 focus:outline-hidden"
        >
          {/* Table of Contents automatic generator at top with anchors */}
          <TableOfContents
            contenu={currentEbook.contenu}
            activeChapterIdx={selectedChapterIdx}
            onSelectChapter={(idx) => {
              setSelectedChapterIdx(idx);
              setAnnouncement(`Chapitre ${chapters[idx]?.numero} : ${chapters[idx]?.titre}`);
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Table of contents sidebar */}
            <aside className="lg:col-span-4 space-y-4">
              {/* Footnotes Display Mode Switcher */}
              <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#3B3020]">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#1B2A4A]" aria-hidden="true" />
                    <span>Notes de bas de page</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#544A39] bg-[#EFE6D5] px-1.5 py-0.5 rounded border border-[#DECFA8]">
                    Dynamique
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#ECE4D2] rounded-lg text-xs font-semibold" role="radiogroup" aria-label="Mode d'affichage des notes">
                  <button
                    role="radio"
                    aria-checked={footnoteDisplayMode === 'click'}
                    onClick={() => setFootnoteDisplayMode('click')}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center space-x-1 focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden ${
                      footnoteDisplayMode === 'click'
                        ? 'bg-[#1B2A4A] text-[#FAF7F0] shadow-xs'
                        : 'text-[#4A4032] hover:text-[#1C1A17]'
                    }`}
                  >
                    <span>Au Clic</span>
                  </button>
                  <button
                    role="radio"
                    aria-checked={footnoteDisplayMode === 'hover'}
                    onClick={() => setFootnoteDisplayMode('hover')}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center space-x-1 focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:outline-hidden ${
                      footnoteDisplayMode === 'hover'
                        ? 'bg-[#1B2A4A] text-[#FAF7F0] shadow-xs'
                        : 'text-[#4A4032] hover:text-[#1C1A17]'
                    }`}
                  >
                    <span>Au Survol</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#544A39] font-serif-book italic leading-tight">
                  {footnoteDisplayMode === 'click'
                    ? 'Cliquez sur les numéros [1] pour afficher la bulle d\'annotation.'
                    : 'Survolez simplement les numéros [1] pour afficher l\'explication.'}
                </p>
              </div>

              {/* Sidebar Chapter Navigator */}
              <nav 
                aria-label="Navigation détaillée des chapitres"
                className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-4 shadow-2xs space-y-3 sticky top-24"
              >
                <div className="flex items-center justify-between border-b border-[#E8DFCC] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3B3020]">
                    Navigation Chapitres
                  </span>
                  <span className="text-[11px] font-mono text-[#544A39] font-semibold">
                    {selectedChapterIdx + 1}/{chapters.length}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {chapters.map((chap, idx) => (
                    <button
                      key={chap.id || idx}
                      aria-current={selectedChapterIdx === idx ? 'page' : undefined}
                      aria-label={`Chapitre ${chap.numero} : ${chap.titre}`}
                      onClick={() => {
                        setSelectedChapterIdx(idx);
                        setAnnouncement(`Chapitre ${chap.numero} : ${chap.titre}`);
                      }}
                      className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-start space-x-2.5 focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:outline-hidden ${
                        selectedChapterIdx === idx
                          ? 'bg-[#2E2820] text-[#FAF7F0] font-semibold shadow-xs'
                          : 'bg-white/70 hover:bg-[#F2EADB] text-[#332B20] border border-[#E8DFCC]'
                      }`}
                    >
                      <span className={`font-mono text-[11px] font-bold ${
                        selectedChapterIdx === idx ? 'text-[#93C5FD]' : 'text-[#1B2A4A]'
                      }`}>
                        0{chap.numero}
                      </span>
                      <div className="space-y-0.5">
                        <span className="block leading-snug line-clamp-2">{chap.titre}</span>
                        <span className={`text-[10px] block line-clamp-1 font-mono ${
                          selectedChapterIdx === idx ? 'text-[#D0C5B0]' : 'text-[#594F40]'
                        }`}>
                          {countChapterWords(chap).toLocaleString()} mots • {calculateChapterA5Pages(chap)} p. A5 {calculateChapterA5Pages(chap) <= 5.0 ? '✓' : '⚠'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>
            </aside>

            {/* Main Manuscript Reader Page */}
            <main 
              id="main-manuscript-content"
              tabIndex={-1}
              className="lg:col-span-8 focus:outline-hidden"
            >
              <div 
                onMouseUp={handleTextMouseUp}
                onTouchEnd={handleTextMouseUp}
                onKeyUp={handleTextMouseUp}
                className="manuscript-paper paper-shadow border border-[#DFD6C4] rounded-2xl p-6 sm:p-10 book-binding-spine space-y-8 font-serif-book relative select-text"
              >
                
                {/* Introduction box (on Chapter 1) */}
                {selectedChapterIdx === 0 && currentEbook.contenu.introduction && (
                  <div 
                    id="manuscript-introduction"
                    className="scroll-mt-28 bg-[#FAF7F0] p-6 rounded-xl border border-[#E3DAC8] space-y-3 mb-8 shadow-inner"
                  >
                    <span className="text-xs font-display-title font-bold uppercase tracking-widest text-[#8C2D19] block">
                      Introduction Préliminaire
                    </span>
                    <div className="text-sm text-[#2E2820] leading-relaxed whitespace-pre-line">
                      {currentEbook.contenu.introduction}
                    </div>
                  </div>
                )}

                {/* Active Chapter Content */}
                {currentChapter ? (
                  <div className="space-y-8">
                    {/* Chapter Header */}
                    <div 
                      id={`chapitre-${currentChapter.numero}`}
                      className="scroll-mt-28 border-b border-[#E8DFCC] pb-6 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-[#544A39]">
                        <span className="font-bold">CHAPITRE {currentChapter.numero}</span>
                        <div className="flex items-center space-x-3">
                          <span>FOLIO {currentChapter.numero}</span>
                        </div>
                      </div>
                      <h2 className="font-display-title text-2xl sm:text-3xl font-bold text-[#1C1A17] tracking-tight">
                        {currentChapter.titre}
                      </h2>

                      {/* Calibration Metrics Bar */}
                      {(() => {
                        const activeWords = countChapterWords(currentChapter);
                        const activeA5Pages = calculateChapterA5Pages(currentChapter);
                        const isTargetWordCount = activeWords >= 2350 && activeWords <= 2650;

                        return (
                          <div className="flex flex-wrap items-center gap-2 pt-3">
                            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono border ${
                              isTargetWordCount
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#F2ECE0] text-[#4A3D2A] border-[#D5CAB7]'
                            }`}>
                              <FileText className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{activeWords.toLocaleString()} mots</span>
                              <span className="text-[10px] opacity-75">(Cible ~2500)</span>
                            </div>

                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono border bg-emerald-50 text-emerald-800 border-emerald-200">
                              <BookOpen className="w-3.5 h-3.5 text-[#1B2A4A]" />
                              <span>{activeA5Pages} pages A5</span>
                              <span className="text-[10px] font-bold">
                                (350 mots/page)
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Chapter Objectives & Key Points */}
                    {currentChapter.points_cles?.length > 0 && (
                      <div className="bg-[#FAF7F0]/90 p-4 rounded-xl border border-[#E8E0D0] text-xs font-sans space-y-2">
                        <span className="font-bold text-[#3B3020] uppercase tracking-wider block text-[11px]">
                          Points Clés du Chapitre
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#332A1F]">
                          {currentChapter.points_cles.map((pt, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="text-[#8C2D19] font-bold" aria-hidden="true">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Chapter Sections */}
                    <div className="space-y-8">
                      {currentChapter.sections.map((section, sIdx) => (
                        <div 
                          key={sIdx} 
                          id={`section-${currentChapter.numero}-${sIdx + 1}`}
                          className="scroll-mt-28 space-y-4"
                        >
                          <div className="space-y-1 flex items-start justify-between">
                            <div>
                              <h3 className="font-display-title text-lg sm:text-xl font-semibold text-[#1C1A17]">
                                {section.titre}
                              </h3>
                              {section.sous_titre && (
                                <h4 className="text-xs uppercase tracking-wider text-[#5C503F] font-sans font-bold">
                                  {section.sous_titre}
                                </h4>
                              )}
                            </div>

                            {/* Section Footnotes Action Button */}
                            <button
                              onClick={() => setEditingSectionFootnotes({
                                chapterIdx: selectedChapterIdx,
                                sectionIdx: sIdx,
                                sectionTitle: section.titre,
                                paragraphes: section.paragraphes,
                                footnotes: section.notes_de_bas_de_page || [],
                              })}
                              aria-label={`Gérer les notes de bas de page de la section ${section.titre}`}
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-sans transition-all border focus-visible:ring-2 focus-visible:ring-[#8C2D19] ${
                                section.notes_de_bas_de_page && section.notes_de_bas_de_page.length > 0
                                  ? 'bg-[#F2ECE0] hover:bg-[#EAE0CD] text-[#7A2413] border-[#D5C6AC] font-bold'
                                  : 'bg-white/70 hover:bg-[#FAF4E6] text-[#4A4032] border-[#E5DAC8] font-semibold'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
                              <span>Notes ({section.notes_de_bas_de_page?.length || 0})</span>
                            </button>
                          </div>

                          {/* Paragraphs with quote triggers & dynamic footnotes */}
                          <div className="space-y-4 text-sm sm:text-base text-[#1C1A17] leading-relaxed">
                            {section.paragraphes.map((p, pIdx) => (
                              <div key={pIdx} className="group/para relative">
                                <FootnoteRenderer
                                  paragraph={p}
                                  footnotes={section.notes_de_bas_de_page || []}
                                  mode={footnoteDisplayMode}
                                />
                                <button
                                  onClick={() => handleOpenSocialQuote(p, `Chapitre ${currentChapter.numero} — ${section.titre}`)}
                                  aria-label="Citer ce paragraphe"
                                  className="absolute -right-2 top-0 opacity-0 group-hover/para:opacity-100 transition-opacity p-1 rounded-md bg-[#F2ECE0] text-[#8C2D19] border border-[#D8CEBA] hover:bg-[#EAE0CD] text-[10px] flex items-center space-x-1 shadow-2xs z-10 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#8C2D19]"
                                >
                                  <Quote className="w-3 h-3" aria-hidden="true" />
                                  <span className="font-sans font-semibold">Citer</span>
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Footnotes bottom summary for this section */}
                          {section.notes_de_bas_de_page && section.notes_de_bas_de_page.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-[#E8DFCC] space-y-1.5 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E3DAC8]">
                              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8C2D19] flex items-center space-x-1.5">
                                <FileText className="w-3 h-3" aria-hidden="true" />
                                <span>Notes &amp; Références de la section :</span>
                              </div>
                              <div className="space-y-1.5 text-xs font-serif-book italic text-[#3B3224]">
                                {section.notes_de_bas_de_page.map((fn) => (
                                  <div key={fn.id} className="flex items-start space-x-2">
                                    <span className="font-mono font-bold text-[#8C2D19] not-italic shrink-0">
                                      [{fn.reference_number}]
                                    </span>
                                    <span>
                                      {fn.terme_cible && <strong className="not-italic text-[#1C1A17]">« {fn.terme_cible} » : </strong>}
                                      {fn.contenu}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Chapter Conclusion */}
                    {currentChapter.conclusion_chapitre && (
                      <div className="pt-6 border-t border-[#E8DFCC] text-sm italic text-[#4A4030] bg-[#FAF7F0] p-4 rounded-xl border border-[#E3DAC8]">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#8C2D19] block mb-1">
                          Synthèse & Transition
                        </span>
                        {currentChapter.conclusion_chapitre}
                      </div>
                    )}

                    {/* General Book Conclusion (on the last chapter if exists) */}
                    {selectedChapterIdx === chapters.length - 1 && currentEbook.contenu.conclusion && (
                      <div 
                        id="manuscript-conclusion"
                        className="scroll-mt-28 bg-[#FAF6EE] p-6 rounded-xl border-2 border-[#D8CEBA] space-y-3 mt-8 shadow-xs"
                      >
                        <span className="text-xs font-display-title font-bold uppercase tracking-widest text-[#8C2D19] block">
                          Épilogue & Conclusion Générale
                        </span>
                        <div className="text-sm text-[#2E2820] leading-relaxed whitespace-pre-line font-serif-book">
                          {currentEbook.contenu.conclusion}
                        </div>
                      </div>
                    )}

                    {/* Pagination Navigation between chapters */}
                    <div className="pt-6 border-t border-[#E8DFCC] space-y-4">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <button
                          disabled={selectedChapterIdx === 0}
                          aria-label="Aller au chapitre précédent (Touche Flèche Gauche ou PageUp)"
                          onClick={() => {
                            const prev = selectedChapterIdx - 1;
                            setSelectedChapterIdx(prev);
                            setAnnouncement(`Chapitre ${chapters[prev]?.numero} : ${chapters[prev]?.titre}`);
                          }}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] ${
                            selectedChapterIdx === 0
                              ? 'opacity-40 cursor-not-allowed border-[#E0D8C8] text-[#8C806D]'
                              : 'bg-[#F2ECE0] text-[#222] border-[#D5CAB7] hover:bg-[#E5DECD] font-semibold'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                          <span>Chapitre précédent (←)</span>
                        </button>

                        <span className="text-xs font-mono text-[#544A39] font-bold">
                          {selectedChapterIdx + 1} sur {chapters.length}
                        </span>

                        <button
                          disabled={selectedChapterIdx === chapters.length - 1}
                          aria-label="Aller au chapitre suivant (Touche Flèche Droite ou PageDown)"
                          onClick={() => {
                            const next = selectedChapterIdx + 1;
                            setSelectedChapterIdx(next);
                            setAnnouncement(`Chapitre ${chapters[next]?.numero} : ${chapters[next]?.titre}`);
                          }}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-[#8C2D19] ${
                            selectedChapterIdx === chapters.length - 1
                              ? 'opacity-40 cursor-not-allowed border-[#E0D8C8] text-[#8C806D]'
                              : 'bg-[#2E2820] text-[#FAF7F0] border-[#2E2820] hover:bg-[#423A2F] font-semibold shadow-xs'
                          }`}
                        >
                          <span>Chapitre suivant (→)</span>
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Keyboard shortcuts hints bar */}
                      <div className="p-2.5 rounded-xl bg-[#F6EFE0] border border-[#E3D8C2] text-[11px] text-[#544A39] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#8C2D19]" aria-hidden="true" />
                          <span>Raccourcis clavier :</span>
                        </div>
                        <div className="flex items-center space-x-3 font-mono text-[10px]">
                          <span><kbd className="px-1.5 py-0.5 bg-white border border-[#D5C6AC] rounded shadow-2xs">←</kbd> / <kbd className="px-1.5 py-0.5 bg-white border border-[#D5C6AC] rounded shadow-2xs">→</kbd> Chapitres</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white border border-[#D5C6AC] rounded shadow-2xs">Alt + 1..4</kbd> Onglets</span>
                          <span><kbd className="px-1.5 py-0.5 bg-white border border-[#D5C6AC] rounded shadow-2xs">Échap</kbd> Fermer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#544A39]">
                    Aucun chapitre sélectionné.
                  </div>
                )}

              </div>
            </main>

          </div>
        </div>
      )}

      {/* TAB: ATELIER COUVERTURE DYNAMIQUE DU LIVRE */}
      {activeTab === 'cover' && (
        <div
          id="panel-cover"
          role="tabpanel"
          aria-labelledby="tab-cover"
          tabIndex={0}
          className="focus:outline-hidden"
        >
          <BookCoverPreview
            ebook={currentEbook}
            defaultAuthor={userProfile.name}
            onExportPdf={(opts) => handleExportPdf(opts)}
            onOpenExportCenter={() => setIsExportCenterOpen(true)}
          />
        </div>
      )}

      {/* TAB 2: PLAN DES CHAPITRES */}
      {activeTab === 'outline' && (
        <div 
          id="panel-outline"
          role="tabpanel"
          aria-labelledby="tab-outline"
          tabIndex={0}
          className="bg-[#FCFBF7] border border-[#DFD6C4] rounded-2xl p-6 sm:p-8 paper-shadow space-y-6 focus:outline-hidden"
        >
          <div className="border-b border-[#E8DFCC] pb-4">
            <h3 className="font-display-title text-xl font-bold text-[#1C1A17]">
              Plan Éditorial Structuré
            </h3>
            <p className="text-xs text-[#544A39] mt-1 font-serif-book italic">
              Découpage et synoptique des chapitres générés par SileyaBook.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentEbook.plan.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-5 space-y-3 relative hover:border-[#2E2820] transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-[#1B2A4A] text-[#93C5FD] flex items-center justify-center font-mono font-bold text-xs">
                    0{item.numero}
                  </span>
                  <span className="text-[11px] font-mono text-[#544A39] font-semibold">
                    FOLIO {idx + 1}
                  </span>
                </div>
                <h4 className="font-display-title text-base font-bold text-[#1C1A17]">
                  {item.titre}
                </h4>
                <p className="text-xs font-serif-book text-[#42382A] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JSON INSPECTOR (ebooks.contenu) */}
      {activeTab === 'json' && (
        <div 
          id="panel-json"
          role="tabpanel"
          aria-labelledby="tab-json"
          tabIndex={0}
          className="bg-[#1F1D1A] border border-[#3A352F] rounded-2xl p-6 shadow-xl space-y-4 text-white focus:outline-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#3A352F] pb-4">
            <div>
              <span className="font-mono text-xs text-[#93C5FD] block font-bold">
                TABLE: ebooks • COLONNE: contenu (JSON)
              </span>
              <p className="text-xs text-neutral-300">
                Structure JSON sérialisée et prête pour l'indexation ou l'API.
              </p>
            </div>

            <button
              onClick={handleCopyJson}
              aria-label="Copier le JSON sérialisé dans le presse-papier"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#2E4374] text-xs font-mono font-medium transition-colors border border-[#2E4374] focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400 font-bold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-300" aria-hidden="true" />
                  <span>Copier le JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="font-mono text-xs text-[#DDD2C0] bg-[#141311] p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
            {JSON.stringify(currentEbook.contenu, null, 2)}
          </pre>
        </div>
      )}

      {/* FLOATING TEXT SELECTION TOOLTIP */}
      {floatingSelection && (
        <div 
          className="fixed z-40 transform -translate-x-1/2 -translate-y-full bg-[#1F1C18] text-[#FAF7F0] px-3 py-1.5 rounded-xl shadow-2xl border border-[#423B30] flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${floatingSelection.x}px`,
            top: `${floatingSelection.y}px`,
          }}
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(floatingSelection.text);
              setFloatingSelection(null);
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#93C5FD] hover:text-white transition-colors py-0.5"
            title="Copier le texte sélectionné"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copier le texte</span>
          </button>
        </div>
      )}

      {/* MODAL: CENTRE D'EXPORTATION & PUBLICATION (PDF Preview, Cover PNG, Cloudinary Upload) */}
      <ExportCenterModal
        isOpen={isExportCenterOpen}
        onClose={() => setIsExportCenterOpen(false)}
        ebook={currentEbook}
        profileId={userProfile.id}
        defaultAuthor={userProfile.name}
        onEbookUpdated={handleEbookUpdate}
        onOpenSocialQuote={(txt, src) => handleOpenSocialQuote(txt, src)}
      />

      {/* MODAL: LISEUSE ÉLECTRONIQUE ET SIMULATEUR EPUB 3 (epub.js) */}
      <EpubReaderModal
        isOpen={isEpubReaderOpen}
        onClose={() => setIsEpubReaderOpen(false)}
        ebook={currentEbook}
        authorName={userProfile.name || 'Auteur du Manuscrit'}
      />

      {/* MODAL: EXPORT PASSAGES EN CARTE IMAGE RÉSEAUX SOCIAUX (Fraunces & Textures) */}
      <SocialQuoteModal
        isOpen={isSocialQuoteModalOpen}
        onClose={() => setIsSocialQuoteModalOpen(false)}
        ebook={currentEbook}
        initialQuoteText={quoteModalText}
        sourceChapterTitle={quoteModalSource}
        defaultAuthor={userProfile.name || 'Auteur du Manuscrit'}
      />

      {/* MODAL: ÉDITEUR ET GESTIONNAIRE DE NOTES DE BAS DE PAGE */}
      {editingSectionFootnotes && (
        <FootnoteManagerModal
          isOpen={Boolean(editingSectionFootnotes)}
          onClose={() => setEditingSectionFootnotes(null)}
          sectionTitle={editingSectionFootnotes.sectionTitle}
          paragraphes={editingSectionFootnotes.paragraphes}
          initialFootnotes={editingSectionFootnotes.footnotes}
          onSaveFootnotes={(updatedFns, updatedParas) => {
            handleSaveSectionFootnotes(
              editingSectionFootnotes.chapterIdx,
              editingSectionFootnotes.sectionIdx,
              updatedFns,
              updatedParas
            );
          }}
        />
      )}

      {/* MODAL: PAGES LIMINAIRES & MENTIONS LÉGALES */}
      <EditorialMetadataModal
        isOpen={isEditorialModalOpen}
        onClose={() => setIsEditorialModalOpen(false)}
        ebook={currentEbook}
        onSave={(updated) => {
          handleEbookUpdate(updated);
          storage.saveEbook(updated, userProfile.id).catch(console.error);
        }}
      />

      {/* MODAL: ATELIER DE RÉVISION, TYPOGRAPHIE & SNAPSHOTS */}
      <RevisionToolsModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        ebook={currentEbook}
        onEbookUpdated={(updated) => {
          handleEbookUpdate(updated);
          storage.saveEbook(updated, userProfile.id).catch(console.error);
        }}
      />

      {/* MODAL: KIT MARKETING & FICHE AMAZON KDP */}
      <KdpMarketingKitModal
        isOpen={isMarketingKitOpen}
        onClose={() => setIsMarketingKitOpen(false)}
        ebook={currentEbook}
        defaultAuthor={userProfile.name || 'Auteur du Manuscrit'}
      />

      {/* MODAL: GABARIT COUVERTURE COMPLÈTE KDP (FULL WRAP) */}
      <KdpFullCoverModal
        isOpen={isKdpCoverOpen}
        onClose={() => setIsKdpCoverOpen(false)}
        ebook={currentEbook}
        onEbookUpdated={(updated) => {
          handleEbookUpdate(updated);
          storage.saveEbook(updated, userProfile.id).catch(console.error);
        }}
      />

      {/* MODAL: SÉLECTEUR DE COUVERTURES HAUTE DÉFINITION SILEYABOOK STITCH */}
      <SileyaCoverSelectorModal
        isOpen={isStitchGalleryOpen}
        onClose={() => setIsStitchGalleryOpen(false)}
        ebook={currentEbook}
        onSelectCover={(coverUrl, title) => {
          const updated = {
            ...currentEbook,
            cover_theme: title || currentEbook.cover_theme
          };
          handleEbookUpdate(updated);
          storage.saveEbook(updated, userProfile.id).catch(console.error);
        }}
      />

      {/* MODAL: GÉNÉRATEUR DE CHAPITRE CALIBRÉ (~2000 MOTS / ≤ 5 PAGES A5) */}
      <CalibratedChapterModal
        isOpen={isCalibratedChapterModalOpen}
        onClose={() => setIsCalibratedChapterModalOpen(false)}
        currentEbook={currentEbook}
        onChapterAdded={handleChapterAdded}
      />

    </div>
  );
};
