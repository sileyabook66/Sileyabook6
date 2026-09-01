import React, { useState } from 'react';
import { 
  ListTree, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Bookmark, 
  ArrowRight, 
  FileText, 
  Sparkles,
  Hash,
  Compass
} from 'lucide-react';
import { EbookContenu, Chapter } from '../types';

interface TableOfContentsProps {
  contenu: EbookContenu;
  activeChapterIdx: number;
  onSelectChapter: (index: number, sectionId?: string) => void;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  contenu,
  activeChapterIdx,
  onSelectChapter,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showSubsections, setShowSubsections] = useState<boolean>(true);

  const chapitres = contenu.chapitres || [];
  const hasIntro = Boolean(contenu.introduction);
  const hasConclusion = Boolean(contenu.conclusion);

  const handleChapterClick = (index: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onSelectChapter(index);

    // Scroll to the chapter anchor if present
    const anchor = document.getElementById(`chapitre-${index + 1}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSectionClick = (chapterIdx: number, sectionIdx: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onSelectChapter(chapterIdx);
    
    setTimeout(() => {
      const sectionAnchor = document.getElementById(`section-${chapterIdx + 1}-${sectionIdx + 1}`);
      if (sectionAnchor) {
        sectionAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleIntroClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onSelectChapter(0);
    setTimeout(() => {
      const el = document.getElementById('manuscript-introduction');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleConclusionClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onSelectChapter(chapitres.length - 1);
    setTimeout(() => {
      const el = document.getElementById('manuscript-conclusion');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  if (!chapitres || chapitres.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Table des matières automatique"
      className={`w-full bg-[#F8FBFF] border border-[#BFDBFE] rounded-2xl paper-shadow overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#EFF5FC] via-[#DBEAFE]/40 to-[#EFF5FC] border-b border-[#BFDBFE] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] text-[#93C5FD] flex items-center justify-center shadow-xs">
            <ListTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display-title text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                Table des Matières & Sommaire
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DBEAFE] text-[#1B2A4A] border border-[#93C5FD]">
                {chapitres.length} chapitres
              </span>
            </div>
            <p className="text-[11px] font-serif-book italic text-[#5A6D88]">
              Générée automatiquement d'après le contenu du manuscrit • Navigation par ancres directes
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Subsections Toggle */}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setShowSubsections(!showSubsections)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border border-[#BFDBFE] transition-all"
              title="Afficher ou masquer les sous-sections"
            >
              <Hash className="w-3 h-3 text-[#1B2A4A]" />
              <span>{showSubsections ? 'Masquer sous-sections' : 'Détailler sous-sections'}</span>
            </button>
          )}

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border border-[#BFDBFE] transition-all"
            title={isExpanded ? 'Réduire la table des matières' : 'Développer la table des matières'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable TOC Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Top Quick Anchors Strip */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#BFDBFE]/60 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A6D88] mr-1 flex items-center space-x-1">
              <Compass className="w-3 h-3 text-[#1B2A4A]" />
              <span>Accès rapide :</span>
            </span>

            {hasIntro && (
              <a
                href="#manuscript-introduction"
                onClick={handleIntroClick}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-[#1B2A4A] hover:text-[#FAF7F0] text-[#1B2A4A] border border-[#BFDBFE] text-[11px] font-serif transition-colors"
              >
                Introduction
              </a>
            )}

            {chapitres.map((c, i) => (
              <a
                key={i}
                href={`#chapitre-${i + 1}`}
                onClick={(e) => handleChapterClick(i, e)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border ${
                  activeChapterIdx === i
                    ? 'bg-[#1B2A4A] text-[#FAF7F0] border-[#1B2A4A] font-bold shadow-2xs'
                    : 'bg-white hover:bg-[#EFF5FC] text-[#1B2A4A] border-[#BFDBFE]'
                }`}
              >
                Ch. 0{c.numero}
              </a>
            ))}

            {hasConclusion && (
              <a
                href="#manuscript-conclusion"
                onClick={handleConclusionClick}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-[#1B2A4A] hover:text-[#FAF7F0] text-[#1B2A4A] border border-[#BFDBFE] text-[11px] font-serif transition-colors"
              >
                Conclusion
              </a>
            )}
          </div>

          {/* Main Book-like Table of Contents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Introduction Card if available */}
            {hasIntro && (
              <div 
                onClick={handleIntroClick}
                className="group cursor-pointer p-3 sm:p-3.5 rounded-xl border border-[#BFDBFE] bg-[#EBF4FE] hover:bg-[#DBEAFE] hover:border-[#1B2A4A] transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-[#DBEAFE] text-[#1B2A4A] font-mono text-[10px] font-bold flex items-center justify-center">
                      I
                    </span>
                    <span className="font-display-title text-xs sm:text-sm font-semibold text-[#0F172A] group-hover:text-[#1B2A4A] transition-colors">
                      Introduction Préliminaire
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A6D88] shrink-0">
                    Folio I
                  </span>
                </div>
                <p className="text-[11px] font-serif-book italic text-[#5A6D88] line-clamp-2 mt-1.5">
                  {contenu.introduction}
                </p>
              </div>
            )}

            {/* Chapters List */}
            {chapitres.map((chap, idx) => {
              const isActive = activeChapterIdx === idx;
              return (
                <div
                  key={chap.id || idx}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#EFF5FC] border-[#1B2A4A] shadow-xs ring-1 ring-[#1B2A4A]/20'
                      : 'bg-[#EBF4FE] hover:bg-[#DBEAFE] border-[#BFDBFE] hover:border-[#93C5FD]'
                  }`}
                >
                  {/* Chapter Top Title with Dotted Leaders */}
                  <div>
                    <a
                      href={`#chapitre-${idx + 1}`}
                      onClick={(e) => handleChapterClick(idx, e)}
                      className="group flex items-start justify-between space-x-2"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-[#1B2A4A] text-[#FAF7F0]'
                            : 'bg-[#1B2A4A] text-[#93C5FD]'
                        }`}>
                          0{chap.numero}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="font-display-title text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#1B2A4A] transition-colors leading-snug">
                            {chap.titre}
                          </h4>
                          {chap.resume && (
                            <p className="text-[11px] font-serif-book italic text-[#5A6D88] line-clamp-2 leading-relaxed">
                              {chap.resume}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-[#5A6D88] shrink-0 font-medium pt-0.5">
                        Folio 0{chap.numero}
                      </span>
                    </a>

                    {/* Subsections List (if enabled) */}
                    {showSubsections && chap.sections && chap.sections.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#BFDBFE]/60 space-y-1 pl-8">
                        {chap.sections.map((sec, sIdx) => (
                          <a
                            key={sIdx}
                            href={`#section-${idx + 1}-${sIdx + 1}`}
                            onClick={(e) => handleSectionClick(idx, sIdx, e)}
                            className="group/sec flex items-center justify-between text-[11px] text-[#5A6D88] hover:text-[#1B2A4A] py-0.5 transition-colors"
                          >
                            <span className="truncate flex items-center space-x-1.5">
                              <span className="text-[9px] font-mono text-[#5A6D88] group-hover/sec:text-[#1B2A4A]">
                                {chap.numero}.{sIdx + 1}
                              </span>
                              <span className="font-serif group-hover/sec:underline truncate">
                                {sec.titre}
                              </span>
                            </span>
                            <span className="text-[9px] font-mono text-[#93C5FD] opacity-0 group-hover/sec:opacity-100 transition-opacity">
                              ancre →
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chapter Footer Info */}
                  <div className="mt-3 pt-2 border-t border-[#BFDBFE]/60 flex items-center justify-between text-[10px] font-mono text-[#5A6D88]">
                    <span>{chap.sections?.length || 0} sections</span>
                    <button
                      type="button"
                      onClick={() => onSelectChapter(idx)}
                      className="text-[#1B2A4A] hover:underline font-serif flex items-center space-x-1 font-semibold"
                    >
                      <span>Consulter le chapitre</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                </div>
              );
            })}

            {/* Conclusion Card if available */}
            {hasConclusion && (
              <div 
                onClick={handleConclusionClick}
                className="group cursor-pointer p-3 sm:p-3.5 rounded-xl border border-[#BFDBFE] bg-[#EBF4FE] hover:bg-[#DBEAFE] hover:border-[#1B2A4A] transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-[#1B2A4A] text-[#FAF7F0] font-mono text-[10px] font-bold flex items-center justify-center">
                      Ω
                    </span>
                    <span className="font-display-title text-xs sm:text-sm font-semibold text-[#0F172A] group-hover:text-[#1B2A4A] transition-colors">
                      Épilogue & Conclusion Générale
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A6D88] shrink-0">
                    Folio Fin
                  </span>
                </div>
                <p className="text-[11px] font-serif-book italic text-[#5A6D88] line-clamp-2 mt-1.5">
                  {contenu.conclusion}
                </p>
              </div>
            )}

          </div>

        </div>
      )}
    </nav>
  );
};
