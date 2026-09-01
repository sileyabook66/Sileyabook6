import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  Image as ImageIcon, 
  CloudUpload, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  Eye, 
  BookOpen, 
  Palette, 
  Layers, 
  FileText, 
  Share2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Quote,
  Tablet,
  BookOpenCheck,
  Printer
} from 'lucide-react';
import { Ebook } from '../types';
import { 
  generatePdfBlob, 
  generatePdfBase64, 
  exportEbookToPdf, 
  exportCoverToPng, 
  getEbookPdfPageCount,
  PdfExportOptions, 
  CoverPngExportOptions 
} from '../lib/pdfExporter';
import { exportEbookToEpub } from '../lib/epubExporter';
import { BookTrimSizeId, getTrimSize } from '../lib/bookTrimSizes';
import { TrimSizeSelector } from './TrimSizeSelector';
import { EpubReaderModal } from './EpubReaderModal';
import { KdpFullCoverModal } from './KdpFullCoverModal';
import { storage } from '../lib/storage';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  defaultAuthor?: string;
  onEbookUpdated?: (updatedEbook: Ebook) => void;
  onOpenSocialQuote?: (text?: string, source?: string) => void;
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  isOpen,
  onClose,
  ebook,
  defaultAuthor = 'Auteur du Manuscrit',
  onEbookUpdated,
  onOpenSocialQuote,
}) => {
  const [authorName, setAuthorName] = useState<string>(defaultAuthor);
  const [coverTheme, setCoverTheme] = useState<'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche'>(
    (ebook.cover_theme as any) || 'velin'
  );
  const [collectionLabel, setCollectionLabel] = useState<string>(
    ebook.contenu.metadata?.genre || 'MANUSCRIT & ÉDITION STUDIO'
  );
  const [trimSize, setTrimSize] = useState<BookTrimSizeId>(
    (ebook.trim_size as BookTrimSizeId) || '6x9'
  );

  // PDF Preview State
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfSizeKb, setPdfSizeKb] = useState<number>(0);
  const [pdfPagesCount, setPdfPagesCount] = useState<number>(
    (ebook.contenu.chapitres?.length || 3) + 3
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // PNG Cover Export State
  const [pngFormat, setPngFormat] = useState<'portrait_hd' | 'square_social' | 'banner_promo'>('portrait_hd');
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null);

  // EPUB Export State
  const [isExportingEpub, setIsExportingEpub] = useState<boolean>(false);
  const [exportedEpub, setExportedEpub] = useState<boolean>(false);
  const [isEpubReaderOpen, setIsEpubReaderOpen] = useState<boolean>(false);
  const [isKdpFullCoverOpen, setIsKdpFullCoverOpen] = useState<boolean>(false);

  // Cloudinary Upload State
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState<boolean>(false);
  const [cloudinaryResult, setCloudinaryResult] = useState<{
    secure_url: string;
    public_id: string;
    mode: string;
    note?: string;
  } | null>(ebook.fichier_pdf_url ? { secure_url: ebook.fichier_pdf_url, public_id: '', mode: 'existing' } : null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [currentStatut, setCurrentStatut] = useState<string>(ebook.statut);

  // Generate initial preview on modal open or options change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGeneratingPdf(true);

    try {
      const exportOptions: PdfExportOptions = {
        authorName,
        coverTheme,
        collectionLabel,
        trimSize,
      };

      const blob = generatePdfBlob(ebook, exportOptions);
      const url = URL.createObjectURL(blob);
      
      if (isMounted) {
        setPdfBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setPdfSizeKb(Math.round(blob.size / 1024));
        const realPageCount = getEbookPdfPageCount(ebook, exportOptions);
        setPdfPagesCount(realPageCount);
        setIsGeneratingPdf(false);
      }

      // Generate PNG preview
      exportCoverToPng(ebook, {
        authorName,
        coverTheme,
        collectionLabel,
        format: pngFormat,
        trimSize,
      }).then((res) => {
        if (isMounted) {
          setPngPreviewUrl(res.dataUrl);
        }
      });

    } catch (e) {
      console.error('Erreur génération preview PDF:', e);
      setIsGeneratingPdf(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, authorName, coverTheme, collectionLabel, trimSize, pngFormat, ebook]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  if (!isOpen) return null;

  // Handler for trim size change that also persists
  const handleSelectTrimSize = (newTrim: BookTrimSizeId) => {
    setTrimSize(newTrim);
    if (onEbookUpdated) {
      onEbookUpdated({
        ...ebook,
        trim_size: newTrim,
      });
    }
  };

  // 1. Direct PDF Download
  const handleDownloadPdf = () => {
    exportEbookToPdf(ebook, {
      authorName,
      coverTheme,
      collectionLabel,
      trimSize,
    });
  };

  // 1b. Direct EPUB Download (Fluid & Reflowable for E-readers)
  const handleDownloadEpub = async () => {
    setIsExportingEpub(true);
    try {
      await exportEbookToEpub(ebook, {
        authorName,
        coverTheme,
        collectionLabel,
      });
      setExportedEpub(true);
      setTimeout(() => setExportedEpub(false), 2500);
    } catch (err) {
      console.error('Erreur export EPUB:', err);
    } finally {
      setIsExportingEpub(false);
    }
  };

  // 2. Direct PNG Cover Download
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const res = await exportCoverToPng(ebook, {
        authorName,
        coverTheme,
        collectionLabel,
        format: pngFormat,
        trimSize,
      });
      res.download();
    } catch (err) {
      console.error('Erreur export PNG:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  // 3. Upload to Cloudinary (resource_type: raw) & Mark as published
  const handleUploadCloudinary = async () => {
    setIsUploadingToCloudinary(true);
    setUploadError(null);

    try {
      // Generate fresh base64 of PDF
      const pdfBase64 = generatePdfBase64(ebook, {
        authorName,
        coverTheme,
        collectionLabel,
        trimSize,
      });

      const response = await fetch('/api/studio/upload-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64,
          ebookId: ebook.id,
          ebookTitle: ebook.titre,
          authorName,
          coverTheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur (${response.status})`);
      }

      const result = await response.json();
      setCloudinaryResult(result);

      // Update ebook in local storage: statut = 'published', fichier_pdf_url = result.secure_url
      const updatedEbook: Ebook = {
        ...ebook,
        statut: 'published',
        fichier_pdf_url: result.secure_url,
        cover_theme: coverTheme,
        updated_at: new Date().toISOString(),
      };

      storage.saveEbook(updatedEbook);
      setCurrentStatut('published');

      if (onEbookUpdated) {
        onEbookUpdated(updatedEbook);
      }
    } catch (err: any) {
      console.error('Erreur upload Cloudinary:', err);
      setUploadError(err.message || 'Échec du téléversement vers Cloudinary');
    } finally {
      setIsUploadingToCloudinary(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const themeNames: Record<string, { label: string; bg: string; border: string }> = {
    velin: { label: 'Bleu Céleste & Or Doré', bg: '#E8F2FC', border: '#3B82F6' },
    carmin: { label: 'Bleu Roi & Or Impérial', bg: '#0B1938', border: '#D4AF37' },
    nuit: { label: 'Bleu Nuit d\'Encre & Argent', bg: '#080E1C', border: '#93C5FD' },
    emeraude: { label: 'Bleu Saphir & Cuivre Lumineux', bg: '#081F38', border: '#60A5FA' },
    blanche: { label: 'Bleu Azur Épuré & Indigo', bg: '#F8FBFF', border: '#2563EB' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in text-white">
      <div 
        className="bg-[#132238] border border-[#2E4374] rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#0B1524] text-white border-b border-[#2E4374] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1B2A4A] border border-[#2E4374] text-[#60A5FA] flex items-center justify-center shadow-inner">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="font-display-title text-lg sm:text-xl font-bold tracking-tight text-white">
                  Centre d'Exportation &amp; Publication
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentStatut === 'published'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  statut: {currentStatut}
                </span>
              </div>
              <p className="text-xs text-[#93C5FD] font-serif-book italic mt-0.5">
                Génération du PDF complet, export PNG de la couverture et téléversement Cloudinary (resource_type: raw)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#93C5FD] hover:text-white transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Top Options Bar (Author, Theme, Collection) */}
          <div className="bg-[#0B1524] border border-[#2E4374] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
              <Palette className="w-4 h-4 text-[#60A5FA]" />
              <span>Paramètres de Composition &amp; Habillage Éditorial</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Author Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#BFDBFE]">
                  Nom de l'Auteur / Signataire
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Auteur du Manuscrit"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#132238] border border-[#2E4374] text-white font-serif focus:ring-2 focus:ring-[#60A5FA] focus:outline-hidden"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#BFDBFE]">
                  Finition &amp; Palette de Reliure
                </label>
                <select
                  value={coverTheme}
                  onChange={(e) => setCoverTheme(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#132238] border border-[#2E4374] text-white font-serif focus:ring-2 focus:ring-[#60A5FA] focus:outline-hidden"
                >
                  {Object.entries(themeNames).map(([key, info]) => (
                    <option key={key} value={key} className="bg-[#132238] text-white">
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Label */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#BFDBFE]">
                  Bandeau / Collection Éditoriale
                </label>
                <input
                  type="text"
                  value={collectionLabel}
                  onChange={(e) => setCollectionLabel(e.target.value)}
                  placeholder="Collection ou Genre"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#132238] border border-[#2E4374] text-white font-serif focus:ring-2 focus:ring-[#60A5FA] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Book Trim Size Selector (Amazon KDP Print Formats) */}
            <div className="pt-3 border-t border-[#2E4374] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-[#BFDBFE] text-xs flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Format &amp; Dimensions du Livre Broché (Amazon KDP)</span>
                </label>
                <span className="text-[11px] font-mono text-[#93C5FD]">
                  Actuel : {getTrimSize(trimSize).inches} ({getTrimSize(trimSize).cm})
                </span>
              </div>

              <TrimSizeSelector
                selectedTrimId={trimSize}
                onSelectTrim={handleSelectTrimSize}
                pageCount={pdfPagesCount}
                compact={false}
              />
            </div>
          </div>

          {/* Main Grid: Preview on Left, Actions & Cloudinary on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Interactive PDF Live Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                  <Eye className="w-4 h-4 text-[#60A5FA]" />
                  <span>Aperçu en Direct du Document PDF</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-[#93C5FD]">
                  <span>Format {getTrimSize(trimSize).inches}</span>
                  <span>•</span>
                  <span>~{pdfPagesCount} folios</span>
                  <span>•</span>
                  <span>{pdfSizeKb} Ko</span>
                </div>
              </div>

              {/* PDF Container */}
              <div className="relative w-full h-[420px] sm:h-[480px] bg-[#0B1524] rounded-2xl overflow-hidden border border-[#2E4374] shadow-inner flex flex-col">
                {isGeneratingPdf && (
                  <div className="absolute inset-0 z-10 bg-[#0B1524]/80 backdrop-blur-2xs flex flex-col items-center justify-center text-white space-y-3">
                    <RefreshCw className="w-7 h-7 text-[#60A5FA] animate-spin" />
                    <span className="text-xs font-serif italic text-[#93C5FD]">Génération du rendu PDF ({getTrimSize(trimSize).inches})...</span>
                  </div>
                )}

                {pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="Aperçu PDF de l'eBook"
                    className="w-full h-full border-0 bg-[#1e293b]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#93C5FD] space-y-2">
                    <BookOpen className="w-8 h-8 text-[#60A5FA]" />
                    <span className="text-xs">Chargement du document...</span>
                  </div>
                )}

                {/* Bottom info bar */}
                <div className="p-2.5 bg-[#080E1C] text-[#BFDBFE] text-[11px] font-serif flex items-center justify-between border-t border-[#2E4374]">
                  <span className="truncate max-w-[280px]">
                    « {ebook.titre} » • {authorName}
                  </span>
                  <span className="font-mono text-[10px] text-[#60A5FA]">
                    {getTrimSize(trimSize).name} ({getTrimSize(trimSize).cm}) • jsPDF natif
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Export Actions & Cloudinary (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* ACTION 1: PDF Export Box */}
              <div className="bg-[#0B1524] border border-[#2E4374] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center border border-[#2E4374]">
                    <FileDown className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <h4 className="font-display-title text-sm font-bold text-white">
                      1. Exporter en Document PDF
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#93C5FD]">
                      Inclut couverture stylisée, sommaire complet et tous les chapitres
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <FileDown className="w-4 h-4 text-white" />
                  <span>Télécharger le PDF ({pdfSizeKb} Ko)</span>
                </button>
              </div>

              {/* ACTION 2: EPUB Export Box (Reflowable / Liseuses) */}
              <div className="bg-[#0B1524] border border-[#2E4374] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center border border-[#2E4374]">
                    <Tablet className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <h4 className="font-display-title text-sm font-bold text-white flex items-center space-x-2">
                      <span>2. Exporter en EPUB (Liseuses)</span>
                      <span className="text-[10px] font-mono font-bold bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] px-2 py-0.5 rounded-full">
                        EPUB 3.0
                      </span>
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#93C5FD]">
                      Mise en page fluide &amp; responsive (Kindle, Kobo, Apple Books, Calibre)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadEpub}
                    disabled={isExportingEpub}
                    className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {isExportingEpub ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                        <span>Génération...</span>
                      </>
                    ) : exportedEpub ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <Tablet className="w-3.5 h-3.5 text-white" />
                        <span>Télécharger .EPUB</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEpubReaderOpen(true)}
                    className="w-full py-2.5 px-3 bg-[#1B2A4A] hover:bg-[#25395F] text-white border border-[#2E4374] rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-[#93C5FD]" />
                    <span>Liseuse (epub.js)</span>
                  </button>
                </div>
              </div>

              {/* ACTION 3: PNG Cover Export Box */}
              <div className="bg-[#0B1524] border border-[#2E4374] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2A4A] text-[#60A5FA] flex items-center justify-center border border-[#2E4374]">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display-title text-sm font-bold text-white">
                      3. Exporter la Couverture en PNG
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#93C5FD]">
                      Usage marketing, réseaux sociaux, Amazon KDP &amp; promotions
                    </p>
                  </div>
                </div>

                {/* Format selection */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setPngFormat('portrait_hd')}
                    className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                      pngFormat === 'portrait_hd'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                        : 'bg-[#132238] text-[#93C5FD] border-[#2E4374] hover:bg-[#182C48] hover:text-white'
                    }`}
                  >
                    Portrait HD<br /><span className="opacity-90">1200x1800</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPngFormat('square_social')}
                    className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                      pngFormat === 'square_social'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                        : 'bg-[#132238] text-[#93C5FD] border-[#2E4374] hover:bg-[#182C48] hover:text-white'
                    }`}
                  >
                    Carré Social<br /><span className="opacity-90">1080x1080</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPngFormat('banner_promo')}
                    className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                      pngFormat === 'banner_promo'
                        ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                        : 'bg-[#132238] text-[#93C5FD] border-[#2E4374] hover:bg-[#182C48] hover:text-white'
                    }`}
                  >
                    Bannière<br /><span className="opacity-90">1200x630</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isExportingPng}
                  className="w-full py-2.5 px-4 bg-[#1B2A4A] hover:bg-[#25395F] text-white border border-[#2E4374] rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-[#60A5FA]" />
                  <span>{isExportingPng ? 'Génération...' : 'Télécharger la Jaquette PNG'}</span>
                </button>
              </div>

              {/* ACTION 4: KDP Full-Wrap Cover (Plat verso + Tranche + Plat recto) */}
              <div className="bg-gradient-to-br from-[#1B2A4A]/60 to-[#0F172A] border border-amber-500/40 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                    <Printer className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-display-title text-sm font-bold text-white flex items-center space-x-2">
                      <span>4. Gabarit Couverture Complète KDP</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                        Broché KDP
                      </span>
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#93C5FD]">
                      Couverture intégrale dépliée (4ème + Dos calculé + 1ère) avec repères
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsKdpFullCoverOpen(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>Ouvrir l'Atelier Couverture Complète KDP</span>
                </button>
              </div>

              {/* ACTION 5: Cloudinary Raw Upload & Publish */}
              <div className="bg-[#0B1524] border border-[#2E4374] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center border border-[#2E4374]">
                    <CloudUpload className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <h4 className="font-display-title text-sm font-bold text-white">
                      5. Hébergement Cloudinary (resource_type: raw)
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#93C5FD]">
                      Gestion des gros fichiers &amp; passage au statut <span className="font-mono font-bold text-emerald-400">'published'</span>
                    </p>
                  </div>
                </div>


                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {cloudinaryResult ? (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 space-y-2.5 text-xs text-white">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Manuscrit publié avec succès !</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-900 px-2 py-0.5 rounded-md text-emerald-300 border border-emerald-600">
                        {currentStatut}
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-300 break-all font-mono bg-[#0B1524] p-2 rounded-lg border border-emerald-600">
                      {cloudinaryResult.secure_url}
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(cloudinaryResult.secure_url)}
                        className="flex-1 py-1.5 px-2.5 bg-[#132238] hover:bg-[#182C48] text-white border border-[#2E4374] rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#93C5FD]" />}
                        <span>{copiedUrl ? 'Lien copié !' : 'Copier l\'URL'}</span>
                      </button>

                      <a
                        href={cloudinaryResult.secure_url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                      >
                        <span>Ouvrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {cloudinaryResult.note && (
                      <p className="text-[10px] text-[#93C5FD] italic border-t border-emerald-700/60 pt-1.5">
                        {cloudinaryResult.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleUploadCloudinary}
                    disabled={isUploadingToCloudinary}
                    className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isUploadingToCloudinary ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        <span>Téléversement vers Cloudinary (raw)...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-4 h-4 text-white" />
                        <span>Publier &amp; Uploader vers Cloudinary (raw)</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center space-x-2 text-[10px] text-[#93C5FD] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Enregistre dans ebooks.fichier_pdf_url et passe le statut à 'published'</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#0B1524] border-t border-[#2E4374] flex items-center justify-between text-xs text-[#93C5FD]">
          <span className="font-serif-book italic">
            eBook ID : <strong className="font-mono text-white">{ebook.id}</strong> • Table ebooks synchronisée
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-all shadow-xs"
          >
            Terminer &amp; Fermer
          </button>
        </div>

      </div>

      {/* LISEUSE EPUB INTERACTIVE (epub.js) */}
      <EpubReaderModal
        isOpen={isEpubReaderOpen}
        onClose={() => setIsEpubReaderOpen(false)}
        ebook={ebook}
        authorName={authorName}
      />

      {/* GABARIT COUVERTURE COMPLÈTE KDP (FULL WRAP) */}
      <KdpFullCoverModal
        isOpen={isKdpFullCoverOpen}
        onClose={() => setIsKdpFullCoverOpen(false)}
        ebook={ebook}
        onEbookUpdated={onEbookUpdated}
      />
    </div>
  );
};
