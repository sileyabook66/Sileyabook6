import React, { useState, useEffect } from 'react';
import { Feather, Sparkles, Check, Clock, BookOpen, Layers } from 'lucide-react';
import { SourceInputData } from '../types';

interface ManuscriptProgressProps {
  sourceData: SourceInputData;
}

const GENERATION_STAGES = [
  {
    step: 1,
    title: "Décryptage de la Source",
    desc: "Extraction sémantique, identification des concepts clés et des perspectives motrices.",
    time: 2500,
  },
  {
    step: 2,
    title: "Conception de l'Architecture Éditoriale",
    desc: "Structuration du plan d'ensemble, hiérarchisation des chapitres et des points de bascule.",
    time: 4500,
  },
  {
    step: 3,
    title: "Rédaction Calligraphique du Manuscrit",
    desc: "Écriture des sections, développement approfondi des paragraphes et des cas d'étude.",
    time: 6000,
  },
  {
    step: 4,
    title: "Reliure & Sauvegarde en Statut Brouillon",
    desc: "Génération de l'objet JSON ebooks.contenu et enregistrement du draft.",
    time: 3000,
  },
];

export const ManuscriptProgress: React.FC<ManuscriptProgressProps> = ({ sourceData }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);
  const [inkWordsCount, setInkWordsCount] = useState(0);
  const [simulatedInkLines, setSimulatedInkLines] = useState<string[]>([
    "Initialisation du codex manuscrit...",
  ]);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < GENERATION_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3200);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 95) {
          const next = prev + Math.floor(Math.random() * 4) + 1;
          return next > 95 ? 95 : next;
        }
        return prev;
      });
    }, 400);

    const inkInterval = setInterval(() => {
      setInkWordsCount((prev) => prev + Math.floor(Math.random() * 25) + 15);
    }, 500);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(inkInterval);
    };
  }, []);

  useEffect(() => {
    const lines = [
      `Analyse de la source : [${sourceData.sourceType.toUpperCase()}] ${sourceData.videoTitle || sourceData.fileName || sourceData.promptText?.slice(0, 45)}...`,
      `Formulation de la thèse centrale et des axes d'approfondissement...`,
      `Calibrage de la tonalité stylistique : ${sourceData.writingTone}...`,
      `Tracé du Chapitre I : Fondations et postulats cardinaux...`,
      `Structuration des sections et développement des études de cas...`,
      `Développement du Chapitre II : Dynamiques opérationnelles et applications...`,
      `Rédaction du Chapitre III : Perspectives durables et élévation de pensée...`,
      `Compilation de l'introduction et de la conclusion prospective...`,
      `Formatage du schéma ebooks.contenu et vérification de la cohérence textuelle...`,
    ];

    let lineIndex = 0;
    const lineTimer = setInterval(() => {
      if (lineIndex < lines.length) {
        setSimulatedInkLines((prev) => [...prev.slice(-5), lines[lineIndex]]);
        lineIndex++;
      }
    }, 1800);

    return () => clearInterval(lineTimer);
  }, [sourceData]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header state banner */}
      <div className="bg-[#EFF5FC] border border-[#BFDBFE] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-[#FAF7F0] flex items-center justify-center shadow-xs">
            <Feather className="w-5 h-5 animate-quill text-[#93C5FD]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display-title text-base font-bold text-[#0F172A]">
                Atelier de Calligraphie Numérique
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#DBEAFE] text-[#1B2A4A] border border-[#93C5FD]">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-xs text-[#5A6D88] font-serif-book italic">
              La plume rédige votre manuscrit page par page...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-[#5A6D88]">
          <div className="text-right">
            <span className="text-[10px] uppercase text-[#5A6D88] block font-sans">Mots couchés</span>
            <span className="font-bold text-sm text-[#0F172A]">{inkWordsCount.toLocaleString('fr-FR')}</span>
          </div>
          <div className="w-px h-7 bg-[#BFDBFE]" />
          <div className="text-right">
            <span className="text-[10px] uppercase text-[#5A6D88] block font-sans">Progression</span>
            <span className="font-bold text-sm text-[#0F172A]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* The Physical Manuscript Paper Canvas */}
      <div className="bg-[#F8FBFF] border border-[#BFDBFE] paper-shadow rounded-2xl p-6 sm:p-10 relative overflow-hidden book-binding-spine min-h-[460px] flex flex-col justify-between">
        
        {/* Subtle watermark / seal */}
        <div className="absolute right-8 top-8 opacity-10 pointer-events-none select-none">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-[#1B2A4A] flex items-center justify-center">
            <span className="font-display-title text-xl font-bold uppercase tracking-widest text-[#1B2A4A]">
              STUDIO
            </span>
          </div>
        </div>

        {/* Top of Manuscript Page */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-4">
            <div className="text-xs font-serif-book italic text-[#5A6D88]">
              Manuscrit en cours de composition • Volume : ~{sourceData.estimatedPages} pages
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#5A6D88]">
              <span>[STATUT: EN_COURS]</span>
              <span>•</span>
              <span>FOLIO I</span>
            </div>
          </div>

          {/* Current Stage Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
            {GENERATION_STAGES.map((stg, idx) => {
              const isDone = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stg.step}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-[#DBEAFE] border-[#1B2A4A] shadow-xs'
                      : isDone
                      ? 'bg-[#EBF4FE] border-[#BFDBFE] opacity-90'
                      : 'bg-transparent border-dashed border-[#BFDBFE] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B2A4A]">
                      Étape 0{stg.step}
                    </span>
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    ) : (
                      <Clock className="w-3 h-3 text-[#5A6D88]" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-1">{stg.title}</h4>
                </div>
              );
            })}
          </div>

          {/* The Live Ink Area */}
          <div className="mt-8 space-y-4 font-serif-book">
            <div className="flex items-center space-x-3 text-[#1B2A4A]">
              <span className="text-2xl font-display-title font-bold text-[#1B2A4A] select-none">
                §
              </span>
              <h3 className="text-lg font-semibold tracking-wide text-[#0F172A]">
                {GENERATION_STAGES[currentStageIdx]?.title}
              </h3>
            </div>

            <p className="text-sm text-[#5A6D88] italic leading-relaxed">
              {GENERATION_STAGES[currentStageIdx]?.desc}
            </p>

            {/* Ink simulation log terminal in manuscript style */}
            <div className="bg-[#EFF5FC] border border-[#BFDBFE] rounded-xl p-4 font-mono text-xs text-[#0F172A] space-y-2 mt-4 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-[#5A6D88] border-b border-[#BFDBFE] pb-1.5 mb-2 font-sans">
                <span className="flex items-center space-x-1.5">
                  <Feather className="w-3.5 h-3.5 text-[#1B2A4A]" />
                  <span>Encre fraîche sur vélin</span>
                </span>
                <span>Diffusion instantanée</span>
              </div>
              {simulatedInkLines.map((line, i) => (
                <div key={i} className="flex items-start space-x-2 animate-ink-bleed">
                  <span className="text-[#93C5FD] select-none">›</span>
                  <span className="leading-relaxed">{line}</span>
                </div>
              ))}
              <div className="flex items-center space-x-1.5 text-[#1B2A4A] pt-1">
                <span className="inline-block w-2 h-4 bg-[#1B2A4A] animate-pulse" />
                <span className="italic font-serif-book text-xs text-[#5A6D88]">
                  Le maître d'œuvre affine les tournures littéraires...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Manuscript Pagination & Progress bar */}
        <div className="pt-6 border-t border-[#BFDBFE] mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A6D88]">
          <div className="w-full sm:w-1/2 bg-[#DBEAFE] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#1B2A4A] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="font-serif-book italic text-[#5A6D88]">
            Composition progressive de l'eBook structuré
          </div>
        </div>

      </div>

    </div>
  );
};
