import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Printer, 
  Ruler, 
  Info,
  FileText,
  Barcode, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Ebook } from '../types';
import { 
  BookTrimSizeId, 
  getTrimSize, 
  calculateKdpCoverDimensions, 
  calculateSpineThicknessMm,
  validateKdpPageCount 
} from '../lib/bookTrimSizes';
import { 
  generateKdpFullCoverPdf, 
  exportKdpFullCoverPdf, 
  renderKdpFullCoverToCanvas, 
  KdpFullCoverOptions 
} from '../lib/kdpCoverGenerator';
import { TrimSizeSelector } from './TrimSizeSelector';

interface KdpFullCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  onEbookUpdated?: (updated: Ebook) => void;
}

export const KdpFullCoverModal: React.FC<KdpFullCoverModalProps> = ({
  isOpen,
  onClose,
  ebook,
  onEbookUpdated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [trimSize, setTrimSize] = useState<BookTrimSizeId>(
    (ebook.trim_size as BookTrimSizeId) || '6x9'
  );
  const [paperType, setPaperType] = useState<'white' | 'cream' | 'color'>('white');
  const [pageCount, setPageCount] = useState<number>(
    ebook.contenu.metadata?.pages_estimees || 48
  );
  const [authorName, setAuthorName] = useState<string>('Auteur du Manuscrit');
  const [publisherName, setPublisherName] = useState<string>('Édition Manuscrit Studio');
  const [coverTheme, setCoverTheme] = useState<'velin' | 'carmin' | 'nuit' | 'emeraude' | 'blanche'>(
    (ebook.cover_theme as any) || 'velin'
  );
  const [isbn, setIsbn] = useState<string>('978-2-1234-5678-9');
  const [retailPrice, setRetailPrice] = useState<string>('14,90 €');
  const [authorBio, setAuthorBio] = useState<string>(
    `À propos de l’auteur : Passionné et expert de son domaine, l'auteur livre ici une méthodologie rigoureuse et accessible.`
  );
  const [synopsis, setSynopsis] = useState<string>(
    ebook.description || `Un ouvrage de référence conçu et structuré pour une expérience de lecture optimale.`
  );
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [includeCropMarks, setIncludeCropMarks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute live KDP dimensions
  const dimensions = calculateKdpCoverDimensions(trimSize, pageCount, paperType);
  const kdpValidation = validateKdpPageCount(pageCount);

  // Re-render canvas preview
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    renderKdpFullCoverToCanvas(canvasRef.current, ebook, {
      trimSize,
      paperType,
      pageCount,
      authorName,
      publisherName,
      coverTheme,
      isbn,
      retailPrice,
      authorBio,
      includeCropMarks,
      showGuides,
    });
  }, [
    isOpen,
    trimSize,
    paperType,
    pageCount,
    authorName,
    publisherName,
    coverTheme,
    isbn,
    retailPrice,
    authorBio,
    includeCropMarks,
    showGuides,
    ebook,
  ]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      exportKdpFullCoverPdf(ebook, {
        trimSize,
        paperType,
        pageCount,
        authorName,
        publisherName,
        coverTheme,
        isbn,
        retailPrice,
        authorBio,
        includeCropMarks,
      });
      if (onEbookUpdated) {
        onEbookUpdated({
          ...ebook,
          trim_size: trimSize,
          cover_theme: coverTheme,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${ebook.titre || 'Livre'}_Couverture_KDP_Complete.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] bg-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Gabarit de Couverture Complète KDP (Full Wrap)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Prêt pour Imprimeur KDP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                4ème de couverture + Tranche / Dos calculé au millimètre + 1ère de couverture avec fond perdu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Live Dimension Calculator Badge */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Format Rogné</span>
              <p className="font-bold text-white">{getTrimSize(trimSize).inches}</p>
              <p className="text-[11px] text-slate-400">{getTrimSize(trimSize).cm}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pages & Papier</span>
              <p className="font-bold text-white">{pageCount} pages</p>
              <p className="text-[11px] text-slate-400 capitalize">Papier {paperType === 'white' ? 'Blanc' : paperType === 'cream' ? 'Crème' : 'Couleur'}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">Épaisseur Dos / Tranche</span>
              <p className="font-bold text-amber-300">{dimensions.spineWidthMm} mm</p>
              <p className="text-[11px] text-slate-400">
                {dimensions.isSpineTextEligible ? 'Texte de tranche autorisé (≥79p)' : 'Tranche sans texte (<79p)'}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Dimensions Totales PDF</span>
              <p className="font-bold text-white">{dimensions.totalWidthMm} × {dimensions.totalHeightMm} mm</p>
              <p className="text-[11px] text-slate-400">+3,2 mm fond perdu inclus</p>
            </div>

            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Résolution 300 DPI</span>
              <p className="font-bold text-white">{dimensions.totalWidthPx300Dpi} × {dimensions.totalHeightPx300Dpi} px</p>
              <p className="text-[11px] text-emerald-400">Norme Haute Définition</p>
            </div>
          </div>

          {/* Canvas Live Preview Card */}
          <div className="bg-[#0B1524] border border-[#334155] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Aperçu de la Maquette Complète Dépliée</span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showGuides}
                    onChange={(e) => setShowGuides(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Afficher repères (Plis & Fond perdu)</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeCropMarks}
                    onChange={(e) => setIncludeCropMarks(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Traits de coupe imprimeur</span>
                </label>
              </div>
            </div>

            {/* Visual Canvas Container */}
            <div className="relative w-full overflow-hidden bg-black/40 rounded-xl border border-slate-700/60 p-2 sm:p-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto max-h-[380px] rounded shadow-xl border border-slate-600/50"
              />

              {/* Sub-label indicators */}
              <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 backdrop-blur-xs px-3 py-1 rounded">
                <span>◀ Plat Verso (4ème de couv)</span>
                <span className="text-amber-400">Tranche / Dos ({dimensions.spineWidthMm} mm)</span>
                <span>Plat Recto (1ère de couv) ▶</span>
              </div>
            </div>

            {/* Spine warning if pages < 79 */}
            {dimensions.spineTextWarning && (
              <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg flex items-start space-x-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{dimensions.spineTextWarning}</span>
              </div>
            )}
          </div>

          {/* Configuration Form Tabs / Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left Column: Format & Paper Settings */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <Ruler className="w-4 h-4" />
                <span>Format & Données Physiques du Livre</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Format Rogné Amazon KDP
                  </label>
                  <TrimSizeSelector
                    selectedTrimId={trimSize}
                    onSelectTrim={setTrimSize}
                    pageCount={pageCount}
                    compact={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nombre de Pages
                    </label>
                    <input
                      type="number"
                      min={24}
                      max={828}
                      value={pageCount}
                      onChange={(e) => setPageCount(Math.max(24, parseInt(e.target.value) || 24))}
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Type de Papier Intérieur
                    </label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value as any)}
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="white">Blanc standard (0.0572 mm/p)</option>
                      <option value="cream">Crème roman (0.0635 mm/p)</option>
                      <option value="color">Couleur standard (0.0596 mm/p)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Thème Visuel de Couverture
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'velin', label: 'Vélin', color: '#FAF7F0', textColor: '#2A241C' },
                      { id: 'carmin', label: 'Carmin', color: '#1B2A4A', textColor: '#FFFFFF' },
                      { id: 'nuit', label: 'Nuit', color: '#0B1524', textColor: '#60A5FA' },
                      { id: 'emeraude', label: 'Émeraude', color: '#0A241E', textColor: '#34D399' },
                      { id: 'blanche', label: 'Blanche', color: '#FFFFFF', textColor: '#0F172A' },
                    ].map((theme) => {
                      const isSelected = coverTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setCoverTheme(theme.id as any)}
                          style={isSelected ? undefined : { backgroundColor: theme.color, color: theme.textColor }}
                          className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all duration-300 ${
                            isSelected
                              ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-[#1877F2]/40 shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {theme.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial & Back Cover Details */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <Barcode className="w-4 h-4" />
                <span>Textes de la 4ème de Couverture &amp; Mentions</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Numéro ISBN-13
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="978-2-1234-5678-9"
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Prix Public Imprimé
                    </label>
                    <input
                      type="text"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(e.target.value)}
                      placeholder="14,90 €"
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nom de la Maison / Éditeur
                  </label>
                  <input
                    type="text"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    placeholder="Édition Manuscrit Studio"
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Résumé &amp; Accroche (4ème de couverture)
                  </label>
                  <textarea
                    rows={2}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notice Biographique de l'Auteur
                  </label>
                  <textarea
                    rows={2}
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-2 text-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#1E293B] border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format conforme au gabarit officiel Amazon KDP Print</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger PNG HD</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isExporting ? 'Génération...' : 'Télécharger PDF Couverture Complète KDP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
