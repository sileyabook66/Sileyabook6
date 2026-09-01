import React from 'react';
import { X, BookOpen, Clock, Layers, ArrowRight, Trash2 } from 'lucide-react';
import { Ebook } from '../types';

interface DraftsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebooks: Ebook[];
  onSelectEbook: (ebook: Ebook) => void;
}

export const DraftsListModal: React.FC<DraftsListModalProps> = ({
  isOpen,
  onClose,
  ebooks,
  onSelectEbook,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#132238] border border-[#2E4374] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] border border-[#2E4374] text-[#60A5FA] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display-title text-base font-bold text-white">
                Mes Manuscrits &amp; Brouillons Sauvegardés
              </h3>
              <p className="text-xs text-[#93C5FD] font-mono">
                Collection ebooks (statut = 'draft')
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
          {ebooks.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-[#93C5FD]">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-[#60A5FA]" />
              <p className="text-sm font-medium">Aucun manuscrit sauvegardé pour l'instant.</p>
              <p className="text-xs text-[#93C5FD]/80">Rendez-vous sur la page de composition pour concevoir votre premier livre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {ebooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    onSelectEbook(b);
                    onClose();
                  }}
                  className="bg-[#0B1524] border border-[#2E4374] hover:border-[#60A5FA] hover:bg-[#182C48] rounded-xl p-4 cursor-pointer transition-all flex items-start justify-between group shadow-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374]">
                        ebooks.statut = '{b.statut}'
                      </span>
                      <span className="text-xs text-[#93C5FD] font-mono">
                        {new Date(b.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h4 className="font-display-title text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                      {b.titre}
                    </h4>

                    <p className="text-xs font-serif-book italic text-[#93C5FD] line-clamp-1">
                      {b.sous_titre}
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-[#93C5FD] font-mono pt-1">
                      <span>{b.contenu?.chapitres?.length || 0} chapitres</span>
                      <span>•</span>
                      <span>{b.credits_consommes} pages décomptées</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[#93C5FD] group-hover:text-[#60A5FA] shrink-0 mt-2">
                    <span className="text-xs font-semibold hidden sm:inline">Ouvrir</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2E4374] bg-[#0B1524] flex items-center justify-between text-xs text-[#93C5FD]">
          <span>{ebooks.length} manuscrit(s) au total</span>
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
