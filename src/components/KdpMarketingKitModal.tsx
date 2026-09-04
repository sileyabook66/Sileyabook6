import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Copy, 
  Check,
  FileText,
  Calculator,
  Tags,
  ListTree,
  Coins,
  ExternalLink,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { Ebook } from '../types';
import { 
  generateAmazonHtmlDescription, 
  generateKdpKeywords, 
  getRecommendedKdpCategories, 
  calculateKdpRoyalties 
} from '../lib/kdpMarketingKit';

interface KdpMarketingKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook;
  defaultAuthor?: string;
}

export const KdpMarketingKitModal: React.FC<KdpMarketingKitModalProps> = ({
  isOpen,
  onClose,
  ebook,
  defaultAuthor = 'Auteur du Manuscrit',
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'keywords' | 'royalties'>('description');
  
  // Description State
  const [htmlDescription, setHtmlDescription] = useState<string>(() =>
    generateAmazonHtmlDescription(ebook, defaultAuthor)
  );
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);

  // Keywords State
  const [keywords, setKeywords] = useState<string[]>(() => generateKdpKeywords(ebook));
  const [copiedKeywords, setCopiedKeywords] = useState<boolean>(false);

  // Royalties Calculator State
  const [pageCount, setPageCount] = useState<number>(ebook.contenu.metadata?.pages_estimees || 35);
  const [retailPrice, setRetailPrice] = useState<number>(14.90);
  const [isPaperback, setIsPaperback] = useState<boolean>(true);
  const [isColor, setIsColor] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = getRecommendedKdpCategories(ebook.contenu.metadata?.genre);
  const royalties = calculateKdpRoyalties(retailPrice, pageCount, isPaperback, isColor);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(htmlDescription);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2500);
  };

  const handleCopyKeywords = () => {
    navigator.clipboard.writeText(keywords.join(', '));
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] bg-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Kit Marketing &amp; Fiche Amazon KDP
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Prêt à Copier-Coller
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Description enrichie HTML, 7 Mots-clés KDP, Catégories BISAC et Simulateur de Redevances
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
            onClick={() => setActiveTab('description')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all duration-300 ${
              activeTab === 'description'
                ? 'border-[#1877F2] text-white bg-[#1877F2]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Description Amazon HTML</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all duration-300 ${
              activeTab === 'keywords'
                ? 'border-[#1877F2] text-white bg-[#1877F2]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>7 Mots-clés &amp; Catégories KDP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('royalties')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all duration-300 ${
              activeTab === 'royalties'
                ? 'border-[#1877F2] text-white bg-[#1877F2]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulateur de Redevances &amp; Prix (€)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: Description Amazon HTML */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Formatée avec les balises HTML acceptées par Amazon KDP (<code className="text-amber-300 font-mono">&lt;b&gt;, &lt;i&gt;, &lt;ul&gt;, &lt;h3&gt;</code>) pour maximiser le taux de conversion de votre page produit.
                </p>
                <button
                  type="button"
                  onClick={handleCopyDescription}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all shrink-0"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le code HTML</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={12}
                value={htmlDescription}
                onChange={(e) => setHtmlDescription(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-600 rounded-xl p-4 text-white font-mono text-xs leading-relaxed focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          )}

          {/* TAB 2: Keywords & Categories */}
          {activeTab === 'keywords' && (
            <div className="space-y-5">
              {/* 7 Keywords */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Tags className="w-4 h-4 text-amber-400" />
                      <span>Les 7 Mots-clés de Recherche KDP (Slots obligatoires)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Remplissez les 7 champs de recherche dans le formulaire Amazon KDP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKeywords}
                    className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    {copiedKeywords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeywords ? 'Copiés !' : 'Copier les 7'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {keywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={kw}
                          onChange={(e) => {
                            const newKws = [...keywords];
                            newKws[idx] = e.target.value;
                            setKeywords(newKws);
                          }}
                          className="bg-transparent border-b border-transparent focus:border-amber-500 text-white text-xs outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories BISAC */}
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <ListTree className="w-4 h-4 text-amber-400" />
                  <span>Catégories Recommandées pour l'Arborescence Amazon</span>
                </h4>
                <div className="space-y-2">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{cat.path}</div>
                        <div className="text-[11px] text-slate-400">Public : {cat.audience}</div>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-amber-300 border border-slate-700">
                        {cat.bisacCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Royalties Simulator */}
          {activeTab === 'royalties' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Prix de Vente Conseillé (€)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="1"
                    max="100"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Nombre de Pages Imprimées</label>
                  <input
                    type="number"
                    min="24"
                    max="1000"
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value) || 24)}
                    className="w-full bg-[#1E293B] border border-slate-600 rounded-xl px-3.5 py-2.5 text-white font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Format</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPaperback(true)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                        isPaperback
                          ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                          : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      Livre Broché
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaperback(false)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                        !isPaperback
                          ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-md shadow-[#1877F2]/25 scale-[1.02]'
                          : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      eBook Kindle
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculation Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-amber-500/40 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Résultat Estimé des Revenus Auteur par Vente</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0B1524] border border-slate-700">
                    <span className="text-[11px] text-slate-400 block">Coût d'Impression KDP</span>
                    <span className="text-xl font-bold font-mono text-slate-200">
                      {isPaperback ? `${royalties.printCostEur.toFixed(2)} €` : '0.00 €'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80">
                    <span className="text-[11px] text-emerald-300 block font-semibold">
                      Votre Bénéfice Net (Redevance)
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      +{royalties.royalty70Eur.toFixed(2)} €
                    </span>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">
                      {isPaperback ? 'Par livre broché vendu (taux 60%)' : 'Par eBook Kindle (taux 70%)'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B1524] border border-slate-700">
                    <span className="text-[11px] text-slate-400 block">Prix Seuil Minimal</span>
                    <span className="text-xl font-bold font-mono text-slate-200">
                      {royalties.breakEvenPrice.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
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
            Fermer le Kit
          </button>
        </div>

      </div>
    </div>
  );
};
