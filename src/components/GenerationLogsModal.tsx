import React from 'react';
import { X, History, Sparkles, Youtube, FileText, PenTool, Clock, Layers, ShieldCheck, AlignLeft } from 'lucide-react';
import { GenerationLog } from '../types';

interface GenerationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GenerationLog[];
}

export const GenerationLogsModal: React.FC<GenerationLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#132238] border border-[#2E4374] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] border border-[#2E4374] text-[#60A5FA] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display-title text-base font-bold text-white">
                Journal des Générations (generation_logs)
              </h3>
              <p className="text-xs text-[#93C5FD] font-mono">
                Audit des appels API Gemini Studio &amp; décompte des tokens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#93C5FD] hover:text-white hover:bg-[#1B2A4A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-[#93C5FD]">
              <History className="w-8 h-8 mx-auto opacity-40 text-[#60A5FA]" />
              <p className="text-sm font-medium">Aucun journal de génération enregistré pour le moment.</p>
              <p className="text-xs text-[#93C5FD]/80">Chaque génération de manuscrit sera tracée ici avec les pages et tokens consommés.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#0B1524] border border-[#2E4374] rounded-xl p-4 space-y-3 hover:border-[#60A5FA] transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">
                          {log.ebook_titre}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-400 border border-emerald-600">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#93C5FD] block">
                        Log ID: {log.id} • {new Date(log.date).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#1B2A4A] rounded-md text-[#60A5FA] border border-[#2E4374]">
                        {log.pages_generees} pages
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2E4374] text-xs font-mono text-[#BFDBFE]">
                    <div>
                      <span className="text-[10px] text-[#93C5FD] block">Source</span>
                      <span className="font-bold flex items-center space-x-1">
                        {log.source_type === 'youtube' && <Youtube className="w-3 h-3 text-red-400 inline" />}
                        {log.source_type === 'document' && <FileText className="w-3 h-3 text-blue-400 inline" />}
                        {log.source_type === 'prompt' && <PenTool className="w-3 h-3 text-purple-400 inline" />}
                        {log.source_type === 'texte_utilisateur' && <AlignLeft className="w-3 h-3 text-[#60A5FA] inline" />}
                        <span className="uppercase text-white">{log.source_type === 'texte_utilisateur' ? 'Texte Auteur' : log.source_type}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#93C5FD] block">Tokens utilisés</span>
                      <span className="font-bold text-white">{log.tokens_utilises.toLocaleString('fr-FR')} tokens</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#93C5FD] block">Modèle Gemini</span>
                      <span className="font-bold text-white truncate block">{log.model_used}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#93C5FD] block">Durée</span>
                      <span className="font-bold text-white">{(log.duration_ms / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2E4374] bg-[#0B1524] flex items-center justify-between text-xs text-[#93C5FD]">
          <span>Total : {logs.length} génération(s) enregistrée(s)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
