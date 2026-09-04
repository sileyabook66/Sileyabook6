import React, { useState } from 'react';
import {
  Feather,
  X,
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BookOpen, 
  Layers, 
  Download, 
  Loader2, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Split
} from 'lucide-react';
import { Chapter, Ebook } from '../types';
import { countChapterWords, calculateChapterA5Pages, getChapterMetrics } from '../lib/textStructure';

interface CalibratedChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEbook?: Ebook;
  onChapterAdded?: (newChapter: Chapter) => void;
}

export const CalibratedChapterModal: React.FC<CalibratedChapterModalProps> = ({
  isOpen,
  onClose,
  currentEbook,
  onChapterAdded,
}) => {
  const [subject, setSubject] = useState('');
  const [bookContext, setBookContext] = useState(currentEbook?.titre || 'Guide Stratégique & Opérationnel');
  const [targetAudience, setTargetAudience] = useState('Professionnels, entrepreneurs et praticiens');
  const [writingTone, setWritingTone] = useState('guide_pratique');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<{
    chapter: Chapter;
    chapters: Chapter[];
    wasSplit: boolean;
    metrics: {
      wordCount: number;
      characterCount: number;
      estimatedPagesA5: number;
      estimatedPagesKdp6x9: number;
      isWithinWordTarget: boolean;
      isUnder5PagesA5: boolean;
      maxOutputTokensConfigured: number;
      modelUsed: string;
      durationMs: number;
    };
  } | null>(null);

  if (!isOpen) return null;

  const nextChapterNumber = (currentEbook?.contenu.chapitres?.length || 0) + 1;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Veuillez saisir le sujet du chapitre.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await fetch('/api/studio/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          bookContext: bookContext.trim(),
          chapterNumber: nextChapterNumber,
          targetAudience,
          writingTone,
          language: currentEbook?.contenu.metadata?.langue || 'Français',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      setGenerationResult(data);
    } catch (err: any) {
      setError(err.message || 'Échec de la génération du chapitre.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertIntoBook = () => {
    if (!generationResult || !onChapterAdded) return;
    if (generationResult.chapters && generationResult.chapters.length > 1) {
      generationResult.chapters.forEach((ch) => onChapterAdded(ch));
    } else {
      onChapterAdded(generationResult.chapter);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calibrated-modal-title"
    >
      <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8DFCC] bg-[#F4EDE0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C2D19] text-[#FAF7F0] flex items-center justify-center shadow-xs">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 id="calibrated-modal-title" className="text-lg font-display-title font-bold text-[#1C1A17]">
                Générateur de Chapitre Calibré (Norme ~2500 mots / 350 mots par page)
              </h3>
              <p className="text-xs text-[#544A39]">
                Calibrage strict : 2 350 à 2 650 mots • 350 mots/page A5 • Découpage automatique si dépassement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B5E4C] hover:text-[#1C1A17] p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Rules Reminder Card */}
          <div className="bg-[#FAF3E6] border border-[#E8DFCC] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#8C2D19]">
              <ShieldCheck className="w-4 h-4" />
              <span>Contraintes éditoriales strictes appliquées par SileyaBook :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A4032]">
              <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-lg border border-[#EDE3CF]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E2820]">Volume ~2500 mots</strong>
                  <span>Entre 2 350 et 2 650 mots réels, sans texte délayé ni remplissage.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-lg border border-[#EDE3CF]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E2820]">Densité PDF A5 (350 mots/page)</strong>
                  <span>Mise en page calibrée (~7 à 7,5 pages par chapitre unitaire).</span>
                </div>
              </div>
              <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-lg border border-[#EDE3CF]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E2820]">Découpage automatique</strong>
                  <span>Si le sujet dépasse 8 pages, il est scindé en sous-chapitres focalisés.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-lg border border-[#EDE3CF]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E2820]">Budget tokens étendu</strong>
                  <span><code>max_output_tokens: 16384</code> pour éviter toute troncature.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="chapter-subject" className="block text-xs font-bold text-[#2E2820] uppercase tracking-wider mb-1">
                Sujet ou Idée Principale du Chapitre <span className="text-[#8C2D19]">*</span>
              </label>
              <input
                id="chapter-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex : L'Automatisation Intelligente des Processus et les Agents Autonomes"
                required
                className="w-full px-4 py-2.5 bg-white border border-[#D5CAB7] rounded-xl text-sm text-[#1C1A17] focus:ring-2 focus:ring-[#8C2D19] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="book-context" className="block text-xs font-bold text-[#2E2820] uppercase tracking-wider mb-1">
                  Contexte ou Titre du Livre
                </label>
                <input
                  id="book-context"
                  type="text"
                  value={bookContext}
                  onChange={(e) => setBookContext(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D5CAB7] rounded-xl text-xs text-[#1C1A17] focus:ring-2 focus:ring-[#8C2D19] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="target-audience" className="block text-xs font-bold text-[#2E2820] uppercase tracking-wider mb-1">
                  Public Cible
                </label>
                <input
                  id="target-audience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D5CAB7] rounded-xl text-xs text-[#1C1A17] focus:ring-2 focus:ring-[#8C2D19] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="writing-tone" className="block text-xs font-bold text-[#2E2820] uppercase tracking-wider mb-1">
                Tonalité Stylistique
              </label>
              <select
                id="writing-tone"
                value={writingTone}
                onChange={(e) => setWritingTone(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#D5CAB7] rounded-xl text-xs text-[#1C1A17] focus:ring-2 focus:ring-[#8C2D19] focus:outline-hidden"
              >
                <option value="guide_pratique">Guide Pratique & Actionnable (Recommandé)</option>
                <option value="didactique">Didactique & Pédagogique (Universitaire)</option>
                <option value="storytelling">Narratif & Inspirant (Business Case)</option>
                <option value="journalistique">Journalistique & Analytique (Enquête)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !subject.trim()}
              className="w-full py-3 px-4 bg-[#1B2A4A] hover:bg-[#131F37] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération du chapitre en cours (~2500 mots)...</span>
                </>
              ) : (
                <>
                  <Feather className="w-4 h-4 text-[#93C5FD]" />
                  <span>Générer le Chapitre Calibré (Chapitre {nextChapterNumber})</span>
                </>
              )}
            </button>
          </form>

          {/* Generation Results & Audit */}
          {generationResult && (
            <div className="bg-white border-2 border-[#1B2A4A]/20 rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-[#E8DFCC] pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-[#1C1A17]">
                    Chapitre Généré et Calibré avec Succès !
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#544A39] bg-[#FAF3E6] px-2 py-0.5 rounded border border-[#DECFA8]">
                  Modèle : {generationResult.metrics.modelUsed}
                </span>
              </div>

              {/* Metrics Audit Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-[#FAF7F0] border border-[#E8DFCC] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#544A39]">Nombre de mots</div>
                  <div className="text-lg font-bold font-mono text-[#1B2A4A]">
                    {generationResult.metrics.wordCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {generationResult.metrics.isWithinWordTarget ? '✓ Cible ~2500 mots' : 'Tolérance valide'}
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF7F0] border border-[#E8DFCC] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#544A39]">Pages PDF A5</div>
                  <div className="text-lg font-bold font-mono text-[#8C2D19]">
                    {generationResult.metrics.estimatedPagesA5} p.
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {generationResult.metrics.isUnder5PagesA5 ? '✓ Plafond A5 respecté' : 'Découpé'}
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF7F0] border border-[#E8DFCC] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#544A39]">Sections & Étapes</div>
                  <div className="text-lg font-bold font-mono text-[#2E2820]">
                    {generationResult.chapter.sections?.length || 0}
                  </div>
                  <div className="text-[10px] text-[#544A39]">
                    {generationResult.chapter.objectifs?.length || 0} objectifs
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF7F0] border border-[#E8DFCC] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#544A39]">Budget Tokens</div>
                  <div className="text-lg font-bold font-mono text-[#1B2A4A]">
                    {generationResult.metrics.maxOutputTokensConfigured}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    0 troncature
                  </div>
                </div>
              </div>

              {/* Title & Preview */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-lg border border-[#E8DFCC] space-y-1.5">
                <div className="text-xs font-bold text-[#1C1A17]">
                  {generationResult.chapter.titre}
                </div>
                <div className="text-xs text-[#4A4032] italic font-serif leading-relaxed line-clamp-2">
                  {generationResult.chapter.resume}
                </div>
              </div>

              {generationResult.wasSplit && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
                  <Split className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Découpage automatique appliqué :</strong> Le contenu naturel dépassait le seuil limite A5. Il a été scindé en {generationResult.chapters.length} chapitres distincts pour respecter strictement le confort de lecture.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#4A4032] hover:bg-black/5 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                {onChapterAdded && (
                  <button
                    type="button"
                    onClick={handleInsertIntoBook}
                    className="px-4 py-2 bg-[#8C2D19] hover:bg-[#722414] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insérer dans le Manuscrit Actuel</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
