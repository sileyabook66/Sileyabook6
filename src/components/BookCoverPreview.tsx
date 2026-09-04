import React, { useState } from 'react';
import {
  User,
  Palette, 
  BookOpen, 
  FileDown, 
  Check, 
  Eye, 
  Layers, 
  Sliders, 
  Feather, 
  Award, 
  Compass, 
  Crown,
  RotateCw,
  Printer,
  Copy,
  Image as ImageIcon,
  CloudUpload,
  Tablet
} from 'lucide-react';
import { Ebook } from '../types';
import { exportEbookToPdf, exportCoverToPng, PdfExportOptions } from '../lib/pdfExporter';
import { exportEbookToEpub } from '../lib/epubExporter';
import { KdpFullCoverModal } from './KdpFullCoverModal';

export type CoverThemeId = 'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche';
export type EmblemId = 'feather' | 'seal' | 'compass' | 'crown';

interface CoverThemeConfig {
  id: CoverThemeId;
  name: string;
  bgGradient: string;
  cardBg: string;
  borderColor: string;
  innerBorderColor: string;
  titleColor: string;
  subtitleColor: string;
  authorColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  foilColor: string;
  spineColor: string;
  tagline: string;
}

export const COVER_THEMES: Record<CoverThemeId, CoverThemeConfig> = {
  velin: {
    id: 'velin',
    name: 'Bleu Céleste & Or Doré',
    bgGradient: 'from-[#F0F7FF] via-[#E4F0FD] to-[#D5E6F8]',
    cardBg: '#E8F2FC',
    borderColor: '#3B82F6',
    innerBorderColor: '#1D4ED8',
    titleColor: '#0F2942',
    subtitleColor: '#335C80',
    authorColor: '#1E40AF',
    badgeBg: '#D8EAFD',
    badgeText: '#1E40AF',
    badgeBorder: '#93C5FD',
    foilColor: '#D4AF37',
    spineColor: '#C8E0F8',
    tagline: 'Collection Céleste Studio',
  },
  carmin: {
    id: 'carmin',
    name: 'Bleu Roi & Or Impérial',
    bgGradient: 'from-[#0F224A] via-[#0B1938] to-[#060E21]',
    cardBg: '#0B1938',
    borderColor: '#D4AF37',
    innerBorderColor: '#F3E5AB',
    titleColor: '#FAF7F0',
    subtitleColor: '#BFDBFE',
    authorColor: '#F3E5AB',
    badgeBg: '#172E5D',
    badgeText: '#F3E5AB',
    badgeBorder: '#D4AF37',
    foilColor: '#D4AF37',
    spineColor: '#081329',
    tagline: 'Édition Impériale Bleu Roi',
  },
  nuit: {
    id: 'nuit',
    name: 'Bleu Nuit d\'Encre & Argent',
    bgGradient: 'from-[#0B1528] via-[#080E1C] to-[#04070E]',
    cardBg: '#080E1C',
    borderColor: '#93C5FD',
    innerBorderColor: '#DBEAFE',
    titleColor: '#F8FAFC',
    subtitleColor: '#93C5FD',
    authorColor: '#E0F2FE',
    badgeBg: '#13233F',
    badgeText: '#BFDBFE',
    badgeBorder: '#3B82F6',
    foilColor: '#93C5FD',
    spineColor: '#03060C',
    tagline: 'Collection Nuit & Philosophie',
  },
  emeraude: {
    id: 'emeraude',
    name: 'Bleu Saphir & Cuivre Lumineux',
    bgGradient: 'from-[#0C2B4E] via-[#081F38] to-[#051426]',
    cardBg: '#081F38',
    borderColor: '#60A5FA',
    innerBorderColor: '#FDE047',
    titleColor: '#F0F9FF',
    subtitleColor: '#BAE6FD',
    authorColor: '#FDE047',
    badgeBg: '#113A63',
    badgeText: '#FDE047',
    badgeBorder: '#3B82F6',
    foilColor: '#F59E0B',
    spineColor: '#040F1D',
    tagline: 'Atelier des Belles-Lettres Saphir',
  },
  blanche: {
    id: 'blanche',
    name: 'Bleu Azur Épuré & Indigo',
    bgGradient: 'from-[#F8FBFF] via-[#EEF6FF] to-[#E0EFFE]',
    cardBg: '#F8FBFF',
    borderColor: '#2563EB',
    innerBorderColor: '#1E3A8A',
    titleColor: '#0F172A',
    subtitleColor: '#3B82F6',
    authorColor: '#1D4ED8',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    badgeBorder: '#BFDBFE',
    foilColor: '#2563EB',
    spineColor: '#DCEAFE',
    tagline: 'Bibliothèque Universelle Azur',
  },
};

interface BookCoverPreviewProps {
  ebook: Ebook;
  defaultAuthor?: string;
  onExportPdf?: (options: PdfExportOptions) => void;
  onOpenExportCenter?: () => void;
}

export const BookCoverPreview: React.FC<BookCoverPreviewProps> = ({
  ebook,
  defaultAuthor,
  onExportPdf,
  onOpenExportCenter,
}) => {
  const initialAuthor = defaultAuthor || 'Auteur du Manuscrit';


  const [authorName, setAuthorName] = useState<string>(initialAuthor);
  const [selectedTheme, setSelectedTheme] = useState<CoverThemeId>('velin');
  const [selectedEmblem, setSelectedEmblem] = useState<EmblemId>('feather');
  const [is3DView, setIs3DView] = useState<boolean>(true);
  const [customTagline, setCustomTagline] = useState<string>(COVER_THEMES.velin.tagline);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingEpub, setIsExportingEpub] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isKdpFullCoverOpen, setIsKdpFullCoverOpen] = useState<boolean>(false);

  const theme = COVER_THEMES[selectedTheme];

  const handleThemeChange = (themeId: CoverThemeId) => {
    setSelectedTheme(themeId);
    setCustomTagline(COVER_THEMES[themeId].tagline);
  };

  const handlePdfExportWithCover = () => {
    setIsExporting(true);
    setTimeout(() => {
      const options: PdfExportOptions = {
        authorName: authorName.trim() || 'Auteur Anonyme',
        coverTheme: selectedTheme,
        collectionLabel: customTagline,
      };
      if (onExportPdf) {
        onExportPdf(options);
      } else {
        exportEbookToPdf(ebook, options);
      }
      setIsExporting(false);
    }, 200);
  };

  const handleEpubExportWithCover = async () => {
    setIsExportingEpub(true);
    try {
      await exportEbookToEpub(ebook, {
        authorName: authorName.trim() || 'Auteur Anonyme',
        coverTheme: selectedTheme,
        collectionLabel: customTagline,
      });
    } catch (err) {
      console.error('Erreur export EPUB:', err);
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handlePngExport = async (format: 'portrait_hd' | 'square_social' | 'banner_promo' = 'portrait_hd') => {
    setIsExportingPng(true);
    try {
      const res = await exportCoverToPng(ebook, {
        authorName: authorName.trim() || 'Auteur Anonyme',
        coverTheme: selectedTheme,
        collectionLabel: customTagline,
        format,
      });
      res.download();
    } catch (err) {
      console.error('Erreur export couverture PNG:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const renderEmblemIcon = (emblem: EmblemId, className = 'w-6 h-6') => {
    switch (emblem) {
      case 'feather':
        return <Feather className={className} />;
      case 'seal':
        return <Award className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'crown':
        return <Crown className={className} />;
    }
  };

  return (
    <div className="w-full bg-[#F8FBFF] border border-[#BFDBFE] rounded-2xl p-6 sm:p-8 paper-shadow space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#BFDBFE] pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#1B2A4A] text-[#93C5FD] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="font-display-title text-xl font-bold text-[#0F172A]">
              Atelier de Couverture Personnalisée
            </h3>
          </div>
          <p className="text-xs font-serif-book italic text-[#5A6D88]">
            Prévisualisez et ajustez la jaquette du livre avec le nom d'auteur avant la publication ou l'exportation.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* PNG Cover Export */}
          <button
            type="button"
            onClick={() => handlePngExport('portrait_hd')}
            disabled={isExportingPng}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border border-[#BFDBFE] rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            title="Télécharger la jaquette au format image PNG (Haute Définition pour réseaux et marketing)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#1B2A4A]" />
            <span>{isExportingPng ? 'Export PNG...' : 'Jaquette PNG'}</span>
          </button>

          {/* KDP Full Wrap Cover Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsKdpFullCoverOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/15 to-amber-600/15 hover:from-amber-500/25 hover:to-amber-600/25 text-amber-950 border border-amber-400/60 rounded-xl text-xs font-bold shadow-2xs transition-all"
            title="Générer la couverture complète prête pour impression Amazon KDP (Plat verso + Tranche + Plat recto)"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>Gabarit KDP Broché</span>
            <span className="text-[9px] font-mono bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-bold">
              Full Wrap
            </span>
          </button>

          {/* Full EPUB Export with this cover */}
          <button
            type="button"
            onClick={handleEpubExportWithCover}
            disabled={isExportingEpub}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#EFF5FC] hover:bg-[#DBEAFE] text-[#1B2A4A] border border-[#BFDBFE] rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            title="Générer l'eBook au format .EPUB 3.0 fluide (Kindle, Kobo, Apple Books, Calibre)"
          >
            <Tablet className="w-3.5 h-3.5 text-[#1B2A4A]" />
            <span>{isExportingEpub ? 'Génération EPUB...' : 'Exporter en EPUB'}</span>
            <span className="text-[9px] font-mono bg-[#1B2A4A] text-white px-1.5 py-0.2 rounded-full font-bold">
              Kindle / Kobo
            </span>
          </button>

          {/* Full PDF Export with this cover */}
          <button
            type="button"
            onClick={handlePdfExportWithCover}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#2E4374] text-[#FAF7F0] rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            title="Générer le document PDF complet avec cette finition"
          >
            <FileDown className="w-4 h-4 text-[#93C5FD]" />
            <span>{isExporting ? 'Composition...' : 'Exporter en PDF'}</span>
          </button>

          {/* Open Full Export Center Modal */}
          {onOpenExportCenter && (
            <button
              type="button"
              onClick={onOpenExportCenter}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#2E4374] hover:bg-[#1B2A4A] text-[#FAF7F0] rounded-xl text-xs font-semibold shadow-xs transition-all"
              title="Centre d'exportation complet, prévisualisation interactive et hébergement Cloudinary"
            >
              <CloudUpload className="w-3.5 h-3.5 text-[#93C5FD]" />
              <span>Publier & Cloudinary</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Author Name Input */}
          <div className="bg-[#F8FBFF] border border-[#BFDBFE] p-4 rounded-xl space-y-3 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#1B2A4A]" />
                <span>Nom de l'Auteur / Signataire</span>
              </span>
              <span className="text-[10px] font-mono text-[#5A6D88] font-normal">
                Directement reporté sur la couverture
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex: Alexandre Dumas, Victor Hugo, etc."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#BFDBFE] bg-white text-sm font-medium text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all"
              />
            </div>
            
            <p className="text-[11px] text-[#5A6D88] font-serif-book italic">
              Cette signature apparaîtra en exergue au bas ou au centre de la reliure et dans les métadonnées PDF.
            </p>
          </div>

          {/* Collection / Tagline Label */}
          <div className="bg-[#F8FBFF] border border-[#BFDBFE] p-4 rounded-xl space-y-2 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Collection & Bandeau Éditorial</span>
            </label>
            <input
              type="text"
              value={customTagline}
              onChange={(e) => setCustomTagline(e.target.value)}
              placeholder="Ex: Collection Les Grands Essais"
              className="w-full px-3 py-2 rounded-lg border border-[#BFDBFE] bg-white text-xs text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#1B2A4A]"
            />
          </div>

          {/* Binding Theme Selector */}
          <div className="bg-[#F8FBFF] border border-[#BFDBFE] p-4 rounded-xl space-y-3 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Palette & Finition de Reliure</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(COVER_THEMES) as CoverThemeId[]).map((tKey) => {
                const t = COVER_THEMES[tKey];
                const isSelected = selectedTheme === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => handleThemeChange(tKey)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all duration-300 flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                        : 'bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border-[#BFDBFE]'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full shrink-0 border shadow-xs transition-all duration-300 ${
                        isSelected ? 'border-white ring-1 ring-white/50' : 'border-white/30'
                      }`}
                      style={{ backgroundColor: t.cardBg }}
                    />
                    <span className={`font-semibold truncate transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-[#1B2A4A]'
                    }`}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emblem Selector */}
          <div className="bg-[#F8FBFF] border border-[#BFDBFE] p-4 rounded-xl space-y-3 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Emblème & Sceau Central</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {(['feather', 'seal', 'compass', 'crown'] as EmblemId[]).map((emb) => {
                const isSelected = selectedEmblem === emb;
                return (
                  <button
                    key={emb}
                    type="button"
                    onClick={() => setSelectedEmblem(emb)}
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                        : 'bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border-[#BFDBFE]'
                    }`}
                  >
                    <div className={`transition-colors duration-300 ${isSelected ? 'text-white' : 'text-[#1B2A4A]'}`}>
                      {renderEmblemIcon(emb, 'w-5 h-5')}
                    </div>
                    <span className={`text-[10px] capitalize transition-colors duration-300 ${
                      isSelected ? 'text-white font-semibold' : 'text-[#1B2A4A]'
                    }`}>
                      {emb === 'feather' ? 'Plume' : emb === 'seal' ? 'Sceau' : emb === 'compass' ? 'Compas' : 'Couronne'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perspective Switcher */}
          <div className="flex items-center justify-between bg-[#EFF5FC] p-3 rounded-xl border border-[#BFDBFE]">
            <span className="text-xs font-semibold text-[#1B2A4A] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Mode de Présentation</span>
            </span>

            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-[#BFDBFE]">
              <button
                type="button"
                onClick={() => setIs3DView(true)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                  is3DView
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#5A6D88] hover:text-[#0F172A]'
                }`}
              >
                Livre 3D
              </button>
              <button
                type="button"
                onClick={() => setIs3DView(false)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                  !is3DView
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#5A6D88] hover:text-[#0F172A]'
                }`}
              >
                Jaquette 2D
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Rendered Book Cover Visual */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl min-h-[560px] relative overflow-hidden">
          
          {/* Subtle wooden/desk background texture feel */}
          <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-black/5 pointer-events-none" />

          {/* Perspective container */}
          <div className={`relative transition-all duration-300 ${is3DView ? 'perspective-1000 my-6' : 'my-2'}`}>
            
            {/* 3D BOOK MOCKUP WRAPPER */}
            <div 
              className={`relative transition-transform duration-500 ${
                is3DView 
                  ? 'rotate-y-[-14deg] rotate-x-[5deg] shadow-[25px_30px_50px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)]' 
                  : 'shadow-2xl'
              }`}
              style={{
                width: '320px',
                minHeight: '480px',
                transformStyle: 'preserve-3d',
              }}
            >
              
              {/* Spine Effect on 3D Left edge */}
              {is3DView && (
                <div 
                  className="absolute top-0 bottom-0 left-0 w-7 origin-left transform -rotate-y-90 translate-z-0 rounded-l-xs flex flex-col items-center justify-between py-6 px-1 text-center select-none"
                  style={{
                    backgroundColor: theme.spineColor,
                    boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.4), inset 2px 0 4px rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#B89758] rotate-90 truncate max-w-[80px]">
                    STUDIO
                  </span>
                  <span className="text-[10px] font-serif font-bold text-white/90 rotate-90 truncate max-w-[220px]">
                    {ebook.titre}
                  </span>
                  <span className="text-[9px] font-serif italic text-white/70 rotate-90 truncate max-w-[80px]">
                    {authorName || 'Auteur'}
                  </span>
                </div>
              )}

              {/* Front Cover Card */}
              <div 
                className="w-full h-full rounded-r-md p-6 sm:p-7 flex flex-col justify-between relative select-none border"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  minHeight: '480px',
                  boxShadow: is3DView 
                    ? 'inset 10px 0 18px rgba(0,0,0,0.18), inset -2px 0 4px rgba(255,255,255,0.1)' 
                    : 'none',
                }}
              >
                {/* Decorative Double Inner Border */}
                <div 
                  className="absolute inset-3 border rounded-xs pointer-events-none"
                  style={{ borderColor: theme.borderColor, opacity: 0.6 }}
                />
                <div 
                  className="absolute inset-4.5 border rounded-xs pointer-events-none"
                  style={{ borderColor: theme.innerBorderColor, opacity: 0.85, borderWidth: '0.75px' }}
                />

                {/* Corner Ornaments */}
                <div className="absolute top-4.5 left-4.5 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: theme.foilColor }} />
                <div className="absolute top-4.5 right-4.5 w-3 h-3 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: theme.foilColor }} />
                <div className="absolute bottom-4.5 left-4.5 w-3 h-3 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: theme.foilColor }} />
                <div className="absolute bottom-4.5 right-4.5 w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: theme.foilColor }} />

                {/* Top Section: Tagline & Genre */}
                <div className="text-center pt-2 space-y-1.5 z-10">
                  <div 
                    className="inline-block px-2.5 py-0.5 rounded text-[10px] font-medium tracking-widest uppercase border"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      borderColor: theme.badgeBorder,
                    }}
                  >
                    {customTagline || ebook.contenu.metadata?.genre || "MANUSCRIT ÉDITORIAL"}
                  </div>
                  <div className="w-12 h-px mx-auto" style={{ backgroundColor: theme.foilColor }} />
                </div>

                {/* Middle Section: Main Title & Subtitle */}
                <div className="text-center my-auto py-4 space-y-3 z-10">
                  <h2 
                    className="font-display-title text-xl sm:text-2xl font-bold tracking-tight leading-snug px-2 line-clamp-4"
                    style={{ color: theme.titleColor }}
                  >
                    {ebook.titre}
                  </h2>

                  {ebook.sous_titre && (
                    <p 
                      className="font-serif-book italic text-xs sm:text-sm leading-relaxed px-3 line-clamp-3"
                      style={{ color: theme.subtitleColor }}
                    >
                      {ebook.sous_titre}
                    </p>
                  )}

                  {/* Central Foil Emblem */}
                  <div className="pt-2 flex items-center justify-center">
                    <div 
                      className="w-10 h-10 rounded-full border flex items-center justify-center shadow-inner"
                      style={{
                        borderColor: theme.foilColor,
                        color: theme.foilColor,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {renderEmblemIcon(selectedEmblem, 'w-5 h-5')}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Author Name & Publisher Brand */}
                <div className="text-center pb-2 space-y-2 z-10 border-t pt-3" style={{ borderColor: 'rgba(200,180,150,0.25)' }}>
                  <div className="space-y-0.5">
                    <span 
                      className="block text-[9px] uppercase tracking-widest font-sans opacity-70"
                      style={{ color: theme.subtitleColor }}
                    >
                      Ouvrage composé par
                    </span>
                    <span 
                      className="block font-display-title font-bold text-sm sm:text-base tracking-wide"
                      style={{ color: theme.authorColor }}
                    >
                      {authorName || 'Auteur du Manuscrit'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-mono px-2 pt-1 opacity-60" style={{ color: theme.subtitleColor }}>
                    <span>GEMINI STUDIO</span>
                    <span>FOLIO IN-OCTAVO</span>
                  </div>
                </div>

                {/* Bookmark ribbon on 3D top */}
                {is3DView && (
                  <div 
                    className="absolute -top-3 right-10 w-4 h-10 shadow-md transform -rotate-2"
                    style={{ backgroundColor: '#1B2A4A' }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-2 bg-transparent"
                      style={{
                        borderBottom: '4px solid transparent',
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                      }}
                    />
                  </div>
                )}

              </div>

              {/* Pages thickness on right in 3D */}
              {is3DView && (
                <div 
                  className="absolute top-1 bottom-1 -right-3 w-3.5 rounded-r-xs"
                  style={{
                    background: 'repeating-linear-gradient(to right, #F8F5EE, #F8F5EE 1px, #E5DFCE 1px, #E5DFCE 2px)',
                    boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.1), 3px 0 5px rgba(0,0,0,0.15)',
                  }}
                />
              )}

            </div>
          </div>

          {/* Quick Caption Under Book */}
          <div className="mt-4 text-center space-y-1">
            <span className="text-xs font-mono text-[#7A6F5E] block">
              Génération dynamique • Rendu fidèle à l'exportation
            </span>
            <p className="text-[11px] font-serif-book italic text-[#998D7B]">
              Le nom d'auteur <strong>« {authorName || 'Auteur'} »</strong> sera intégré sur la page de garde du PDF.
            </p>
          </div>

        </div>

      </div>

      {/* KDP Full Wrap Cover Modal */}
      <KdpFullCoverModal
        isOpen={isKdpFullCoverOpen}
        onClose={() => setIsKdpFullCoverOpen(false)}
        ebook={ebook}
      />

    </div>
  );
};
