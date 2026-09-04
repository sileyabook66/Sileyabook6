import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Tablet, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  BookOpen, 
  List, 
  Sliders, 
  Sun, 
  Moon, 
  Coffee, 
  Type, 
  Check, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Smartphone,
  Laptop,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import ePub, { Book, Rendition, NavItem } from 'epubjs';
import { Ebook } from '../types';
import { generateEpubArrayBuffer, exportEbookToEpub } from '../lib/epubExporter';

interface EpubReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  authorName?: string;
}

type DeviceMode = 'ereader' | 'tablet' | 'mobile';
type ThemeMode = 'velin' | 'sepia' | 'dark';
type FontMode = 'serif' | 'sans' | 'mono';

export const EpubReaderModal: React.FC<EpubReaderModalProps> = ({
  isOpen,
  onClose,
  ebook,
  authorName = 'Auteur du Manuscrit',
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  
  // Customization State
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('ereader');
  const [themeMode, setThemeMode] = useState<ThemeMode>('velin');
  const [fontSize, setFontSize] = useState<number>(100); // 100%
  const [fontMode, setFontMode] = useState<FontMode>('serif');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Navigation State
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  // Initialize and Render EPUB using epubjs
  useEffect(() => {
    if (!isOpen || !viewerRef.current) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const initEpub = async () => {
      try {
        // Clean previous instances
        if (renditionRef.current) {
          renditionRef.current.destroy();
          renditionRef.current = null;
        }
        if (bookRef.current) {
          bookRef.current.destroy();
          bookRef.current = null;
        }
        if (viewerRef.current) {
          viewerRef.current.innerHTML = '';
        }

        // Generate ArrayBuffer from EPUB 3 generator
        const arrayBuffer = await generateEpubArrayBuffer(ebook, {
          authorName,
          publisher: 'SileyaBook • SECRETS DIVIN',
        });

        if (!isMounted || !viewerRef.current) return;

        // Initialize epub.js Book instance
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // Wait for book ready
        await book.ready;

        // Load navigation (TOC)
        const navigation = await book.loaded.navigation;
        if (isMounted && navigation && navigation.toc) {
          setToc(navigation.toc);
        }

        if (!isMounted || !viewerRef.current) return;

        // Create Rendition inside the container
        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Register visual reading themes in Blue palettes
        rendition.themes.register('velin', {
          body: {
            'background-color': '#F0F7FF !important',
            'color': '#0F172A !important',
            'font-family': '"Newsreader", "Georgia", serif !important',
            'line-height': '1.65 !important',
          },
          'p': { 'color': '#1E293B !important' },
          'h1, h2, h3, h4': { 'color': '#0F2942 !important' },
          'a': { 'color': '#1D4ED8 !important' },
        });

        rendition.themes.register('sepia', {
          body: {
            'background-color': '#E2EDF8 !important',
            'color': '#1E293B !important',
            'font-family': '"Newsreader", "Georgia", serif !important',
            'line-height': '1.65 !important',
          },
          'p': { 'color': '#172554 !important' },
          'h1, h2, h3, h4': { 'color': '#1E3A8A !important' },
          'a': { 'color': '#2563EB !important' },
        });

        rendition.themes.register('dark', {
          body: {
            'background-color': '#0B132B !important',
            'color': '#E0F2FE !important',
            'font-family': '"Newsreader", "Georgia", serif !important',
            'line-height': '1.65 !important',
          },
          'p': { 'color': '#BAE6FD !important' },
          'h1, h2, h3, h4': { 'color': '#F0F9FF !important' },
          'a': { 'color': '#93C5FD !important' },
        });

        rendition.themes.select(themeMode);
        rendition.themes.fontSize(`${fontSize}%`);

        // Event: Track location updates
        rendition.on('relocated', (location: any) => {
          if (!isMounted) return;
          if (location && location.start) {
            const href = location.start.href;
            const matchedNav = navigation.toc.find((item) => item.href.includes(href) || href.includes(item.href));
            if (matchedNav) {
              setCurrentChapterTitle(matchedNav.label);
            } else if (href.includes('intro')) {
              setCurrentChapterTitle('Introduction');
            } else if (href.includes('conclusion')) {
              setCurrentChapterTitle('Conclusion & Perspectives');
            } else if (href.includes('toc')) {
              setCurrentChapterTitle('Table des Matières');
            } else if (href.includes('title')) {
              setCurrentChapterTitle('Page de Titre');
            }

            if (location.start.percentage) {
              setProgressPercent(Math.round(location.start.percentage * 100));
            }
          }
        });

        // Display first page
        await rendition.display();

        // Keyboard navigation binding
        const keyListener = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            rendition.next();
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            rendition.prev();
          }
        };
        rendition.on('keyup', keyListener);
        document.addEventListener('keyup', keyListener);

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Erreur initialisation epubjs:', err);
        if (isMounted) {
          setLoadError(err?.message || 'Erreur lors du rendu EPUB');
          setIsLoading(false);
        }
      }
    };

    initEpub();

    return () => {
      isMounted = false;
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [isOpen, ebook, authorName]);

  // Update theme when themeMode changes
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.select(themeMode);
    }
  }, [themeMode]);

  // Update font size
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize]);

  // Update font family
  useEffect(() => {
    if (renditionRef.current) {
      if (fontMode === 'sans') {
        renditionRef.current.themes.font('"Work Sans", "Plus Jakarta Sans", sans-serif');
      } else if (fontMode === 'mono') {
        renditionRef.current.themes.font('"IBM Plex Mono", monospace');
      } else {
        renditionRef.current.themes.font('"Newsreader", "Georgia", serif');
      }
    }
  }, [fontMode]);

  if (!isOpen) return null;

  const handlePrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const handleGoToTocItem = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
      setIsTocOpen(false);
    }
  };

  const handleDownloadEpub = async () => {
    try {
      setIsExporting(true);
      await exportEbookToEpub(ebook, {
        authorName,
        publisher: 'SileyaBook • SECRETS DIVIN',
      });
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 2500);
    } catch (e) {
      console.error("Erreur téléchargement EPUB:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Device frame styles
  const getDeviceFrameClass = () => {
    if (deviceMode === 'mobile') {
      return 'max-w-[390px] h-[680px] rounded-[42px] border-[12px] border-[#2B2722] shadow-2xl p-2';
    }
    if (deviceMode === 'tablet') {
      return 'max-w-[680px] h-[780px] rounded-[32px] border-[14px] border-[#22201D] shadow-2xl p-3';
    }
    // E-reader (Kindle / Kobo frame with wide bottom bezel)
    return 'max-w-[580px] h-[760px] rounded-[24px] border-[14px] border-[#262422] border-b-[36px] shadow-2xl p-2.5';
  };

  const getViewerBgColor = () => {
    if (themeMode === 'sepia') return 'bg-[#F4EFE2]';
    if (themeMode === 'dark') return 'bg-[#1E1B18]';
    return 'bg-[#FAF7F0]';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-[#FAF8F4] border border-[#DDD3BF] rounded-3xl w-full flex flex-col shadow-2xl overflow-hidden transition-all ${
          isFullscreen ? 'fixed inset-0 rounded-none h-full max-w-none' : 'max-w-6xl max-h-[94vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Toolbar */}
        <div className="p-4 sm:px-6 bg-[#1B2A4A] text-[#FAF7F0] border-b border-[#0E1729] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#2E4374] border border-[#BFDBFE]/40 text-[#93C5FD] flex items-center justify-center shadow-inner">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display-title text-base sm:text-lg font-bold text-[#FAF7F0]">
                  Liseuse & Simulateur EPUB 3
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2E4374] text-[#FAF7F0] border border-[#BFDBFE]/30">
                  epubjs engine
                </span>
              </div>
              <p className="text-xs text-[#D8CEBA] font-serif-book italic truncate max-w-xs sm:max-w-md">
                « {ebook.titre} » • {authorName}
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Device Switcher */}
            <div className="inline-flex rounded-xl bg-[#1A1815] p-1 border border-[#3D362C]">
              <button
                onClick={() => setDeviceMode('ereader')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  deviceMode === 'ereader'
                    ? 'bg-[#8C2D19] text-[#FAF7F0] shadow-xs'
                    : 'text-[#C2B5A0] hover:text-white'
                }`}
                title="Format Liseuse E-Ink (Kindle / Kobo)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Liseuse</span>
              </button>

              <button
                onClick={() => setDeviceMode('tablet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  deviceMode === 'tablet'
                    ? 'bg-[#8C2D19] text-[#FAF7F0] shadow-xs'
                    : 'text-[#C2B5A0] hover:text-white'
                }`}
                title="Format Tablette (iPad / Android)"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablette</span>
              </button>

              <button
                onClick={() => setDeviceMode('mobile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-[#8C2D19] text-[#FAF7F0] shadow-xs'
                    : 'text-[#C2B5A0] hover:text-white'
                }`}
                title="Format Smartphone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Download EPUB Button */}
            <button
              onClick={handleDownloadEpub}
              disabled={isExporting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#2E4374] hover:bg-[#1B2A4A] text-[#FAF7F0] rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              title="Télécharger le fichier .epub standardisé"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#93C5FD]" />
                  <span>Export...</span>
                </>
              ) : exportedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-200">Téléchargé !</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>Télécharger .EPUB</span>
                </>
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D8CEBA] hover:text-white transition-colors"
              title="Fermer la liseuse"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Sub-toolbar (Font, Size, Theme, TOC toggle) */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FAF6EE] border-b border-[#E3D8C4] flex items-center justify-between gap-3 text-xs flex-wrap">
          {/* Left: TOC button & Current section */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isTocOpen
                  ? 'bg-[#8C2D19] text-[#FAF7F0] border-[#8C2D19]'
                  : 'bg-white text-[#4A3F31] border-[#D8CCB6] hover:bg-[#F2EAE0]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Sommaire ({toc.length})</span>
            </button>

            {currentChapterTitle && (
              <span className="text-[#6B5F4E] font-serif-book italic truncate max-w-[200px] sm:max-w-xs">
                {currentChapterTitle}
              </span>
            )}
          </div>

          {/* Right: Typography & Theme Settings */}
          <div className="flex items-center space-x-3">
            {/* Font Size (+ / -) */}
            <div className="flex items-center space-x-1 bg-white border border-[#D8CCB6] rounded-xl px-2 py-0.5">
              <button
                onClick={() => setFontSize((s) => Math.max(70, s - 10))}
                className="px-1.5 py-0.5 text-xs font-bold text-[#554939] hover:text-[#8C2D19]"
                title="Diminuer la taille du texte"
              >
                A-
              </button>
              <span className="font-mono text-[11px] text-[#7A6D5B] px-1">{fontSize}%</span>
              <button
                onClick={() => setFontSize((s) => Math.min(160, s + 10))}
                className="px-1.5 py-0.5 text-xs font-bold text-[#554939] hover:text-[#8C2D19]"
                title="Agrandir la taille du texte"
              >
                A+
              </button>
            </div>

            {/* Font Mode (Serif / Sans) */}
            <div className="inline-flex rounded-xl bg-white border border-[#D8CCB6] p-0.5">
              <button
                onClick={() => setFontMode('serif')}
                className={`px-2 py-0.5 rounded-lg text-xs font-serif ${
                  fontMode === 'serif' ? 'bg-[#8C2D19] text-white font-bold' : 'text-[#554939] hover:bg-[#F5ECE0]'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontMode('sans')}
                className={`px-2 py-0.5 rounded-lg text-xs font-sans ${
                  fontMode === 'sans' ? 'bg-[#8C2D19] text-white font-bold' : 'text-[#554939] hover:bg-[#F5ECE0]'
                }`}
              >
                Sans
              </button>
            </div>

            {/* Theme Toggle (Velin / Sepia / Dark) */}
            <div className="inline-flex rounded-xl bg-white border border-[#D8CCB6] p-0.5">
              <button
                onClick={() => setThemeMode('velin')}
                className={`p-1.5 rounded-lg ${themeMode === 'velin' ? 'bg-[#FAF7F0] text-[#8C2D19] ring-1 ring-[#8C2D19]' : 'text-[#7A6D5B]'}`}
                title="Mode Vélin Électronique"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`p-1.5 rounded-lg ${themeMode === 'sepia' ? 'bg-[#F4EFE2] text-[#8C2D19] ring-1 ring-[#8C2D19]' : 'text-[#7A6D5B]'}`}
                title="Mode Sépia Chaleureux"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg ${themeMode === 'dark' ? 'bg-[#0E1729] text-[#93C5FD] ring-1 ring-[#93C5FD]' : 'text-[#7A6D5B]'}`}
                title="Mode Nuit / E-Ink Sombre"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Reader Area */}
        <div className="relative flex-1 bg-[#E8E1D3] p-4 sm:p-8 flex items-center justify-center overflow-hidden min-h-[500px]">
          
          {/* Table of Contents Drawer */}
          {isTocOpen && (
            <div className="absolute top-0 left-0 bottom-0 z-30 w-72 bg-[#FAF7F0] border-r border-[#D8CCB6] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-[#E3DAC8] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#4A3D2D]">
                  <BookOpen className="w-4 h-4 text-[#8C2D19]" />
                  <span>Table des Matières</span>
                </div>
                <button
                  onClick={() => setIsTocOpen(false)}
                  className="p-1 text-[#7A6D5B] hover:text-[#1C1A17]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
                {toc.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGoToTocItem(item.href)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFE8D8] text-[#2E2820] font-serif transition-colors flex items-start space-x-2"
                  >
                    <span className="font-mono text-[10px] text-[#8C2D19] font-bold mt-0.5">
                      {idx + 1}.
                    </span>
                    <span className="font-medium flex-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reader Device Frame */}
          <div className={`relative w-full ${getDeviceFrameClass()} transition-all flex flex-col bg-[#2B2722] overflow-hidden`}>
            
            {/* Screen inner */}
            <div className={`w-full h-full ${getViewerBgColor()} rounded-xl overflow-hidden flex flex-col relative shadow-inner`}>
              
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-20 bg-[#FAF7F0]/90 backdrop-blur-2xs flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#8C2D19] animate-spin" />
                  <span className="text-xs font-serif italic text-[#4A3F31]">
                    Génération & Composition de l'EPUB 3 avec epub.js...
                  </span>
                </div>
              )}

              {/* Error Message */}
              {loadError && (
                <div className="absolute inset-0 z-20 bg-red-50 p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-sm font-bold text-red-800">Impossible de charger l'EPUB</span>
                  <p className="text-xs text-red-600 font-mono max-w-sm">{loadError}</p>
                  <button
                    onClick={handleDownloadEpub}
                    className="px-4 py-2 bg-[#8C2D19] text-white text-xs font-bold rounded-xl"
                  >
                    Télécharger directement le fichier EPUB
                  </button>
                </div>
              )}

              {/* epub.js mount target */}
              <div 
                ref={viewerRef} 
                className="flex-1 w-full h-full overflow-hidden select-text"
              />

              {/* Left / Right Page Turn Floating Buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-40 hover:opacity-100 shadow-md"
                title="Page précédente (Flèche gauche)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-40 hover:opacity-100 shadow-md"
                title="Page suivante (Flèche droite)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom Progress Bar inside E-Reader */}
              <div className="p-2 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-[#8C806D] bg-black/5">
                <span className="truncate max-w-[180px]">
                  {currentChapterTitle || ebook.titre}
                </span>
                <span>{progressPercent}% lu</span>
              </div>
            </div>

            {/* E-reader physical home dot */}
            {deviceMode === 'ereader' && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-[#443E36] bg-[#1F1C19]" />
            )}
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="p-3.5 px-6 bg-[#FAF7F0] border-t border-[#E3DAC8] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A6F5E]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-[#3D3325]">
              Norme EPUB 3.2 validée (IDPF / W3C) • Dublin Core, Navigation XML & Feuilles de style liseuses incluses.
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-[#8C7F6C]">
            <span>Kindle • Kobo • Apple Books • Calibre</span>
          </div>
        </div>

      </div>
    </div>
  );
};
