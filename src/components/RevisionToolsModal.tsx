import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search,
  Replace,
  Type,
  PenTool,
  History,
  RotateCcw, 
  Check, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Layers 
} from 'lucide-react';
import { Ebook, EbookSnapshot } from '../types';
import { 
  globalSearchAndReplace, 
  cleanFrenchTypography, 
  getEbookSnapshots, 
  saveEbookSnapshot, 
  deleteEbookSnapshot,
  TypographyFixReport 
} from '../lib/revisionTools';

interface RevisionToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  onEbookUpdated: (updatedEbook: Ebook) => void;
}

export const RevisionToolsModal: React.FC<RevisionToolsModalProps> = ({
  isOpen,
  onClose,
  ebook,
  onEbookUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'typo' | 'snapshots'>('search');

  // Search & Replace state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);
  const [searchResultMsg, setSearchResultMsg] = useState<string | null>(null);

  // Typo cleaner state
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [typoReport, setTypoReport] = useState<TypographyFixReport | null>(null);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<EbookSnapshot[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');
  const [snapshotSuccessMsg, setSnapshotSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(getEbookSnapshots(ebook.id));
      setSearchResultMsg(null);
      setTypoReport(null);
    }
  }, [isOpen, ebook.id]);

  if (!isOpen) return null;

  const handleExecuteReplace = () => {
    if (!searchTerm.trim()) return;

    // Automatic backup before big replace
    saveEbookSnapshot(ebook, `Sauvegarde avant remplacement de "${searchTerm}"`);

    const result = globalSearchAndReplace(ebook, searchTerm, replaceTerm, {
      caseSensitive,
      wholeWord,
    });

    onEbookUpdated(result.updatedEbook);
    setSearchResultMsg(
      `${result.replacedCount} occurrence(s) remplacée(s) dans le manuscrit.`
    );
    setSnapshots(getEbookSnapshots(ebook.id));
  };

  const handleCleanTypography = () => {
    setIsCleaning(true);

    // Save snapshot first
    saveEbookSnapshot(ebook, `Sauvegarde avant Nettoyage Typographique`);

    setTimeout(() => {
      const { updatedEbook, report } = cleanFrenchTypography(ebook);
      onEbookUpdated(updatedEbook);
      setTypoReport(report);
      setIsCleaning(false);
      setSnapshots(getEbookSnapshots(ebook.id));
    }, 400);
  };

  const handleCreateSnapshot = () => {
    const snap = saveEbookSnapshot(ebook, snapshotLabel);
    setSnapshots(getEbookSnapshots(ebook.id));
    setSnapshotLabel('');
    setSnapshotSuccessMsg(`Version « ${snap.label} » enregistrée.`);
    setTimeout(() => setSnapshotSuccessMsg(null), 3000);
  };

  const handleRestoreSnapshot = (snap: EbookSnapshot) => {
    if (window.confirm(`Voulez-vous vraiment restaurer la version "${snap.label}" ?`)) {
      // Create backup of current before restoring
      saveEbookSnapshot(ebook, `Point de sauvegarde avant restauration`);
      onEbookUpdated(snap.data);
      setSnapshots(getEbookSnapshots(ebook.id));
      alert(`Version "${snap.label}" restaurée avec succès.`);
    }
  };

  const handleDeleteSnapshot = (snapId: string) => {
    deleteEbookSnapshot(ebook.id, snapId);
    setSnapshots(getEbookSnapshots(ebook.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] bg-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B4DE8] to-[#1B36C9] text-white flex items-center justify-center shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Atelier de Révision Éditoriale &amp; Typographie
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2B4DE8]/20 text-[#93C5FD] border border-[#2B4DE8]/40">
                  Qualité KDP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Recherche globale, respect des règles typographiques françaises et historique de versions
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

        {/* Tabs */}
        <div className="flex border-b border-[#334155] bg-[#131F37] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'search'
                ? 'border-[#2B4DE8] text-[#60A5FA] bg-[#2B4DE8]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Recherche &amp; Remplacement Global</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typo')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'typo'
                ? 'border-[#2B4DE8] text-[#60A5FA] bg-[#2B4DE8]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Nettoyeur Typographique Français</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snapshots')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'snapshots'
                ? 'border-[#2B4DE8] text-[#60A5FA] bg-[#2B4DE8]/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historique des Snapshots ({snapshots.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* TAB 1: Search & Replace */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B1524]/40 border border-[#2B4DE8]/30 text-xs text-[#DBEAFE]">
                Remplacez instantanément un terme, un nom de personnage ou une expression dans l'ensemble des titres, chapitres, sections, introductions et conclusions. Un point de sauvegarde est créé automatiquement avant chaque modification.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-[#60A5FA]" />
                    <span>Texte à rechercher</span>
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: Chapître ou ancien terme..."
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Replace className="w-3.5 h-3.5 text-[#60A5FA]" />
                    <span>Remplacer par</span>
                  </label>
                  <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Ex: Chapitre ou nouveau terme..."
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6 text-xs text-slate-300">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-slate-600 text-[#2B4DE8] focus:ring-[#2B4DE8] bg-[#1E293B]"
                  />
                  <span>Respecter la casse (Majuscules/Minuscules)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wholeWord}
                    onChange={(e) => setWholeWord(e.target.checked)}
                    className="rounded border-slate-600 text-[#2B4DE8] focus:ring-[#2B4DE8] bg-[#1E293B]"
                  />
                  <span>Mots entiers uniquement</span>
                </label>
              </div>

              {searchResultMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{searchResultMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteReplace}
                  disabled={!searchTerm.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#2B4DE8] hover:bg-[#1B36C9] disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
                >
                  <Replace className="w-4 h-4" />
                  <span>Remplacer dans tout le livre</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: French Typography Cleaner */}
          {activeTab === 'typo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Règles typographiques de l'Imprimerie Nationale appliquées</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Insertion d'espaces insécables avant <code className="text-amber-300 font-mono">; : ! ? % € $</code></li>
                  <li>Conversion des guillemets dactylographiques <code className="text-amber-300 font-mono">"..."</code> en guillemets français <code className="text-amber-300 font-mono">« ... »</code></li>
                  <li>Correction des espaces doubles et suppression des espaces orphelins</li>
                  <li>Formatage des tirets de dialogue en cadratins <code className="text-amber-300 font-mono">—</code></li>
                </ul>
              </div>

              {typoReport && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Nettoyage typographique terminé : {typoReport.totalCorrections} corrections apportées</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-emerald-600/50">
                      <span className="block text-lg font-bold text-white font-mono">{typoReport.nonBreakingSpacesAdded}</span>
                      <span className="text-[11px] text-slate-400">Espaces insécables</span>
                    </div>
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-emerald-600/50">
                      <span className="block text-lg font-bold text-white font-mono">{typoReport.quotesCorrected}</span>
                      <span className="text-[11px] text-slate-400">Guillemets « »</span>
                    </div>
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-emerald-600/50">
                      <span className="block text-lg font-bold text-white font-mono">{typoReport.doubleSpacesFixed}</span>
                      <span className="text-[11px] text-slate-400">Espaces doubles</span>
                    </div>
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-emerald-600/50">
                      <span className="block text-lg font-bold text-white font-mono">{typoReport.dashesFormatted}</span>
                      <span className="text-[11px] text-slate-400">Tirets cadratins —</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCleanTypography}
                  disabled={isCleaning}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
                >
                  <Type className="w-4 h-4 text-slate-950" />
                  <span>{isCleaning ? 'Nettoyage en cours...' : 'Nettoyer et Formater la Typographie'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Snapshots */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder="Nom de la version (ex: Avant relecture Chapitre 3)..."
                  className="flex-1 bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleCreateSnapshot}
                  className="px-4 py-2.5 bg-[#2B4DE8] hover:bg-[#1B36C9] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>Créer un Snapshot</span>
                </button>
              </div>

              {snapshotSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs">
                  {snapshotSuccessMsg}
                </div>
              )}

              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  Aucun snapshot enregistré pour ce manuscrit. Créez-en un pour sécuriser vos révisions.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3.5 rounded-xl bg-[#1E293B] border border-slate-700 hover:border-slate-600 flex items-center justify-between transition-all text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center space-x-2">
                          <span>{snap.label}</span>
                          <span className="text-[10px] font-mono text-[#93C5FD] bg-[#0B1524] px-2 py-0.5 rounded border border-[#2E4374]">
                            {snap.chapters_count} chapitres
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(snap.created_at).toLocaleString('fr-FR')}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(snap)}
                          className="px-3 py-1.5 bg-[#2B4DE8]/80 hover:bg-[#2B4DE8] text-white rounded-lg font-semibold flex items-center space-x-1.5 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all"
                          title="Supprimer ce snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1E293B] border-t border-[#334155] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-all shadow-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
