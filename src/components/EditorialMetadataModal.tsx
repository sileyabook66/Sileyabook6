import React, { useState } from 'react';
import { 
  X, 
  BookMarked, 
  Check, 
  Save, 
  ShieldCheck, 
  Feather,
  Barcode,
  Info, 
  Layers, 
  Heart, 
  Building2, 
  FileText 
} from 'lucide-react';
import { Ebook, MentionsLegales } from '../types';

interface EditorialMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  onSave: (updatedEbook: Ebook) => void;
}

export const EditorialMetadataModal: React.FC<EditorialMetadataModalProps> = ({
  isOpen,
  onClose,
  ebook,
  onSave,
}) => {
  const currentMentions = ebook.contenu.mentions_legales || {};

  const [isbn, setIsbn] = useState<string>(currentMentions.isbn || '978-2-1234-5678-9');
  const [isbnEbook, setIsbnEbook] = useState<string>(currentMentions.isbn_ebook || '');
  const [depotLegal, setDepotLegal] = useState<string>(currentMentions.depot_legal || 'Août 2026');
  const [editeur, setEditeur] = useState<string>(currentMentions.editeur || 'Éditions Manuscrit Studio');
  const [imprimePar, setImprimePar] = useState<string>(
    currentMentions.imprime_par || 'Imprimé par Amazon Fulfillment Services'
  );
  const [droitsReserves, setDroitsReserves] = useState<string>(
    currentMentions.droits_reserves ||
      "Tous droits de traduction, de reproduction et d'adaptation réservés pour tous pays. Toute reproduction, même partielle, par quelque procédé que ce soit, est strictement interdite sans autorisation préalable de l'auteur et de l'éditeur."
  );
  const [dedicace, setDedicace] = useState<string>(currentMentions.dedicace || '');
  const [remerciements, setRemerciements] = useState<string>(currentMentions.remerciements || '');
  const [biographieAuteur, setBiographieAuteur] = useState<string>(
    currentMentions.biographie_auteur || ''
  );
  const [duMemeAuteurText, setDuMemeAuteurText] = useState<string>(
    (currentMentions.du_meme_auteur || []).join('\n')
  );

  const [activeTab, setActiveTab] = useState<'legal' | 'dedicace' | 'bio'>('legal');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const duMemeAuteur = duMemeAuteurText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedMentions: MentionsLegales = {
      isbn: isbn.trim(),
      isbn_ebook: isbnEbook.trim() || undefined,
      depot_legal: depotLegal.trim(),
      editeur: editeur.trim(),
      imprime_par: imprimePar.trim(),
      droits_reserves: droitsReserves.trim(),
      dedicace: dedicace.trim() || undefined,
      remerciements: remerciements.trim() || undefined,
      biographie_auteur: biographieAuteur.trim() || undefined,
      du_meme_auteur: duMemeAuteur.length > 0 ? duMemeAuteur : undefined,
    };

    const updatedEbook: Ebook = {
      ...ebook,
      contenu: {
        ...ebook.contenu,
        mentions_legales: updatedMentions,
      },
      updated_at: new Date().toISOString(),
    };

    onSave(updatedEbook);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const generateMockIsbn = () => {
    const prefix = '978-2';
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    const formatted = `${prefix}-${String(rand).slice(0, 4)}-${String(rand).slice(4, 7)}-${String(rand).slice(7, 8)}`;
    setIsbn(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] bg-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B4DE8] to-[#1B36C9] text-white flex items-center justify-center shadow-md">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Pages Liminaires &amp; Mentions Légales Professionnelles
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Copyright &amp; ISBN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Achevé d'imprimer, Dépôt légal, Dédicace et Mentions obligatoires du livre broché
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#334155] bg-[#131F37] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'legal'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mentions Légales &amp; ISBN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dedicace')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'dedicace'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Dédicace &amp; Remerciements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'bio'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Biographie &amp; Autres Ouvrages</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* ISBN 13 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Barcode className="w-3.5 h-3.5 text-blue-400" />
                      <span>Numéro ISBN-13 (Broché KDP)</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateMockIsbn}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Générer format standard
                    </button>
                  </div>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-2-1234-5678-9"
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    Fourni par Amazon KDP gratuitement lors de la publication ou par l'AFNIL.
                  </p>
                </div>

                {/* Dépôt Légal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Date du Dépôt Légal</span>
                  </label>
                  <input
                    type="text"
                    value={depotLegal}
                    onChange={(e) => setDepotLegal(e.target.value)}
                    placeholder="Ex: Août 2026 ou 3e trimestre 2026"
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    Mention obligatoire pour les ouvrages imprimés en France (BnF).
                  </p>
                </div>

                {/* Éditeur */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Maison d'Édition / Marque Éditoriale</span>
                  </label>
                  <input
                    type="text"
                    value={editeur}
                    onChange={(e) => setEditeur(e.target.value)}
                    placeholder="Ex: Éditions Manuscrit Studio ou Auto-édition"
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                </div>

                {/* Imprimeur */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mention de l'Imprimeur</span>
                  </label>
                  <input
                    type="text"
                    value={imprimePar}
                    onChange={(e) => setImprimePar(e.target.value)}
                    placeholder="Ex: Imprimé par Amazon Fulfillment Services"
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                </div>

              </div>

              {/* Copyright clause */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mention de Copyright &amp; Protection des Droits</span>
                </label>
                <textarea
                  rows={3}
                  value={droitsReserves}
                  onChange={(e) => setDroitsReserves(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'dedicace' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dédicace de l'Ouvrage (Page liminaire 3)</span>
                </label>
                <textarea
                  rows={3}
                  value={dedicace}
                  onChange={(e) => setDedicace(e.target.value)}
                  placeholder="Ex : À ceux qui cherchent sans relâche à comprendre et à transmettre..."
                  className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-sm italic leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Sera élégamment centrée en italique sur une page dédiée avant le sommaire.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Feather className="w-3.5 h-3.5 text-amber-400" />
                  <span>Remerciements &amp; Témoignages</span>
                </label>
                <textarea
                  rows={3}
                  value={remerciements}
                  onChange={(e) => setRemerciements(e.target.value)}
                  placeholder="Ex : Je tiens à remercier mes relecteurs, conseillers et l'équipe éditoriale..."
                  className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Feather className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notice Biographique de l'Auteur (En fin d'ouvrage)</span>
                </label>
                <textarea
                  rows={4}
                  value={biographieAuteur}
                  onChange={(e) => setBiographieAuteur(e.target.value)}
                  placeholder="Présentation du parcours de l'auteur, ses expertises et sa vision..."
                  className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Du Même Auteur (Un titre par ligne)</span>
                </label>
                <textarea
                  rows={3}
                  value={duMemeAuteurText}
                  onChange={(e) => setDuMemeAuteurText(e.target.value)}
                  placeholder={"Traité d'Édition Contemporaine (2024)\nGuide Pratique de la Rédaction (2025)"}
                  className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#1E293B] border-t border-[#334155] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all font-semibold"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Enregistré avec succès !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Appliquer au Manuscrit</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
