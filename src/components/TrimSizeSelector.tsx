import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  Sparkles, 
  Info, 
  Layers, 
  Maximize2, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  Ruler, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BOOK_TRIM_SIZES, 
  BookTrimSize, 
  BookTrimSizeId, 
  TrimCategory, 
  getTrimSize, 
  calculateSpineThicknessMm, 
  validateKdpPageCount 
} from '../lib/bookTrimSizes';

interface TrimSizeSelectorProps {
  selectedTrimId?: BookTrimSizeId;
  onSelectTrim: (trimId: BookTrimSizeId) => void;
  pageCount?: number;
  compact?: boolean;
  className?: string;
}

export const TrimSizeSelector: React.FC<TrimSizeSelectorProps> = ({
  selectedTrimId = '6x9',
  onSelectTrim,
  pageCount = 48,
  compact = false,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<TrimCategory>('tous');
  const [paperType, setPaperType] = useState<'white' | 'cream' | 'color'>('white');
  const [showKdpDetails, setShowKdpDetails] = useState<boolean>(!compact);

  const currentTrim = getTrimSize(selectedTrimId);
  const spineThickness = calculateSpineThicknessMm(pageCount, paperType);
  const kdpValidation = validateKdpPageCount(pageCount);

  // Filter sizes based on tab
  const filteredSizes = BOOK_TRIM_SIZES.filter((size) => {
    if (activeCategory === 'tous') return true;
    if (activeCategory === 'popular') return size.isPopular;
    return size.category === activeCategory;
  });

  const categories: Array<{ id: TrimCategory; label: string; count: number }> = [
    { id: 'tous', label: 'Tous les formats', count: BOOK_TRIM_SIZES.length },
    { id: 'popular', label: 'Formats Recommandés KDP', count: BOOK_TRIM_SIZES.filter(s => s.isPopular).length },
    { id: 'guides', label: 'Guides & Pratiques', count: BOOK_TRIM_SIZES.filter(s => s.category === 'guides').length },
    { id: 'romans', label: 'Romans & Récits', count: BOOK_TRIM_SIZES.filter(s => s.category === 'romans').length },
    { id: 'grands_formats', label: 'Grands Formats & A4', count: BOOK_TRIM_SIZES.filter(s => s.category === 'grands_formats').length },
    { id: 'carres', label: 'Carrés (8.25" & 8.5")', count: BOOK_TRIM_SIZES.filter(s => s.category === 'carres').length },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#BFDBFE]/60">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-[#EFF5FC] text-[#5A6D88] border border-[#BFDBFE]/50'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-white/25 text-white' : 'bg-[#EFF5FC] text-[#5A6D88]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Trim Size Cards */}
      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredSizes.map((size) => {
          const isSelected = size.id === currentTrim.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelectTrim(size.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-[#1877F2]/40 shadow-lg shadow-[#1877F2]/25 scale-[1.01]'
                  : 'bg-[#F8FBFF] hover:bg-white text-[#0F172A] border-[#BFDBFE] hover:border-[#93C5FD] shadow-2xs'
              }`}
            >
              {/* Header: Name + Badge */}
              <div className="space-y-1 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold text-sm tracking-tight transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-[#0F172A]'
                    }`}>
                      {size.inches}
                    </span>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isSelected ? 'text-blue-100' : 'text-[#5A6D88]'
                    }`}>
                      ({size.cm})
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-white text-[#1877F2] flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : size.isPopular ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      Populaire
                    </span>
                  ) : null}
                </div>

                {/* Usage text */}
                <p className={`text-xs line-clamp-2 leading-relaxed transition-colors duration-300 ${
                  isSelected ? 'text-blue-50 font-normal' : 'text-[#334155]'
                }`}>
                  {size.usage}
                </p>
              </div>

              {/* Footer info & KDP status */}
              <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] transition-colors duration-300 ${
                isSelected ? 'border-white/20 text-blue-100' : 'border-[#BFDBFE]/60 text-[#5A6D88]'
              }`}>
                <span className="flex items-center space-x-1">
                  <Ruler className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#1B2A4A]'}`} />
                  <span>{size.widthMm} × {size.heightMm} mm</span>
                </span>

                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors duration-300 ${
                  isSelected 
                    ? 'text-white bg-white/20 border-white/30 font-semibold' 
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                }`}>
                  KDP Broché
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Format KDP Technical Specs & Blueprint */}
      <div className="bg-[#EFF5FC] border border-[#BFDBFE] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#1B2A4A] text-white flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Fiche Technique Amazon KDP : {currentTrim.name}
              </h4>
              <p className="text-[11px] text-[#5A6D88]">
                {currentTrim.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKdpDetails(!showKdpDetails)}
            className="text-xs font-semibold text-[#1B2A4A] hover:underline flex items-center space-x-1"
          >
            <Sliders className="w-3 h-3" />
            <span>{showKdpDetails ? 'Masquer détails KDP' : 'Afficher calculs KDP'}</span>
          </button>
        </div>

        {/* Technical specs grid */}
        {showKdpDetails && (
          <div className="pt-2 border-t border-[#BFDBFE]/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Dimensions */}
            <div className="bg-white p-2.5 rounded-lg border border-[#BFDBFE]/60 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#5A6D88]">Dimensions Rognées</span>
              <p className="font-bold text-[#0F172A]">{currentTrim.widthMm} × {currentTrim.heightMm} mm</p>
              <p className="text-[10px] text-[#5A6D88]">{currentTrim.inches} / {currentTrim.cm}</p>
            </div>

            {/* Spine thickness */}
            <div className="bg-white p-2.5 rounded-lg border border-[#BFDBFE]/60 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#5A6D88]">Tranche / Dos</span>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value as any)}
                  className="text-[9px] bg-[#EFF5FC] border border-[#BFDBFE] rounded px-1 py-0.5 text-[#0F172A]"
                >
                  <option value="white">Papier Blanc</option>
                  <option value="cream">Papier Crème</option>
                  <option value="color">Couleur</option>
                </select>
              </div>
              <p className="font-bold text-[#0F172A]">{spineThickness} mm</p>
              <p className="text-[10px] text-[#5A6D88]">Pour {pageCount} pages</p>
            </div>

            {/* Margins */}
            <div className="bg-white p-2.5 rounded-lg border border-[#BFDBFE]/60 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#5A6D88]">Marges Intérieures</span>
              <p className="font-bold text-[#0F172A]">{currentTrim.recommendedMarginMm} mm</p>
              <p className="text-[10px] text-[#5A6D88]">Fond perdu : +3,2 mm</p>
            </div>

            {/* Page Count Limits */}
            <div className="bg-white p-2.5 rounded-lg border border-[#BFDBFE]/60 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#5A6D88]">Limites KDP Broché</span>
              <p className="font-bold text-[#0F172A]">24 à 828 pages</p>
              <p className={`text-[10px] font-medium ${kdpValidation.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                {kdpValidation.isValid ? 'Conforme (Broché)' : 'Nombre de pages à vérifier'}
              </p>
            </div>
          </div>
        )}

        {/* Special KDP Note (e.g. A5 note or Square note) */}
        {currentTrim.kdpNote && (
          <div className="bg-blue-50/80 border border-blue-200 p-2.5 rounded-lg flex items-start space-x-2 text-[11px] text-blue-900">
            <Info className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Note Amazon KDP : </span>
              <span>{currentTrim.kdpNote}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
