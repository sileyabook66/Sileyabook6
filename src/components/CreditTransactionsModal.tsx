import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  ArrowDownRight, 
  ArrowUpRight,
  Gift,
  ShoppingBag,
  Layers, 
  ShieldCheck, 
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  Package,
  Info,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { CreditTransaction, CreditTransactionType, UserProfile, CreditPackSchema } from '../types';
import { storage, CATALOGUE_CREDIT_PACKS } from '../lib/storage';

interface CreditTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  transactions: CreditTransaction[];
  onAddBonusCredits?: (amount: number) => void;
}

export const CreditTransactionsModal: React.FC<CreditTransactionsModalProps> = ({
  isOpen,
  onClose,
  profile,
  transactions,
  onAddBonusCredits,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'packs_schema'>('transactions');
  const [filterType, setFilterType] = useState<string>('all');
  const [preparedOrderInfo, setPreparedOrderInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const totalGenerationsDebited = transactions
    .filter((tx) => tx.type === 'generation')
    .reduce((acc, tx) => acc + Math.abs(tx.montant), 0);

  const totalBonusesGranted = transactions
    .filter((tx) => tx.type === 'bonus')
    .reduce((acc, tx) => acc + Math.abs(tx.montant), 0);

  const totalPurchasesDone = transactions
    .filter((tx) => tx.type === 'achat')
    .reduce((acc, tx) => acc + Math.abs(tx.montant), 0);

  const handleTestPrepareOrder = (pack: CreditPackSchema) => {
    const order = storage.preparePurchaseOrder(pack.sku, profile.id);
    setPreparedOrderInfo(
      `Schéma de commande initialisé avec succès : ID « ${order.id} », SKU « ${order.pack_sku} », ${order.pages_allouees} pages pour ${order.montant_eur} € (statut: ${order.statut}). Structure prête pour branchement Stripe.`
    );
    setTimeout(() => setPreparedOrderInfo(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#132238] border border-[#2E4374] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1B2A4A] border border-[#2E4374] text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5 text-[#60A5FA]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display-title text-lg font-bold text-white">
                  Grand Livre des Crédits &amp; Transactions
                </h3>
                <span className="font-ibm-mono text-[10px] px-2 py-0.5 rounded-full bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] font-semibold">
                  table: credit_transactions
                </span>
              </div>
              <p className="text-xs text-[#93C5FD] font-serif-book mt-0.5">
                Traçabilité intégrale de chaque mouvement de pages (générations, bonus, achats futurs).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#93C5FD] hover:text-white hover:bg-[#1B2A4A] transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#0B1524] border-b border-[#2E4374] text-xs font-ibm-mono">
          <div className="bg-[#132238] p-3 rounded-xl border border-[#2E4374]">
            <span className="text-[10px] text-[#93C5FD] uppercase block font-sans font-semibold">Solde Disponible</span>
            <span className="text-xl font-bold text-white">{profile.credits_pages} p</span>
          </div>
          <div className="bg-[#132238] p-3 rounded-xl border border-[#2E4374]">
            <span className="text-[10px] text-[#93C5FD] uppercase block font-sans font-semibold">Pages Générées (Débits)</span>
            <span className="text-xl font-bold text-[#60A5FA]">-{totalGenerationsDebited} p</span>
          </div>
          <div className="bg-[#132238] p-3 rounded-xl border border-[#2E4374]">
            <span className="text-[10px] text-[#93C5FD] uppercase block font-sans font-semibold">Bonus &amp; Dotations</span>
            <span className="text-xl font-bold text-emerald-400">+{totalBonusesGranted} p</span>
          </div>
          <div className="bg-[#132238] p-3 rounded-xl border border-[#2E4374]">
            <span className="text-[10px] text-[#93C5FD] uppercase block font-sans font-semibold">Achats de Packs</span>
            <span className="text-xl font-bold text-[#93C5FD]">+{totalPurchasesDone} p</span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-4 pb-2 border-b border-[#2E4374] flex items-center justify-between flex-wrap gap-2 bg-[#132238]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#0B1524] text-[#93C5FD] border border-[#2E4374] hover:bg-[#182C48]'
              }`}
            >
              Historique des Mouvements ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('packs_schema')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'packs_schema'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#0B1524] text-[#93C5FD] border border-[#2E4374] hover:bg-[#182C48]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#BFDBFE]" />
              <span>Schéma Achats &amp; Packs de Crédits</span>
            </button>
          </div>

          {activeTab === 'transactions' && (
            <div className="flex items-center space-x-1.5 text-xs font-medium">
              <span className="text-[#93C5FD] text-[11px]">Filtrer :</span>
              {['all', 'generation', 'bonus', 'achat'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-colors ${
                    filterType === type
                      ? 'bg-[#2563EB] text-white font-bold'
                      : 'text-[#93C5FD] hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'Tous' : type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {preparedOrderInfo && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{preparedOrderInfo}</span>
            </div>
          )}

          {activeTab === 'transactions' ? (
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-[#93C5FD]">
                  <Receipt className="w-8 h-8 mx-auto opacity-40 text-[#60A5FA]" />
                  <p className="text-sm font-medium">Aucune transaction trouvée pour ce filtre.</p>
                </div>
              ) : (
                <div className="border border-[#2E4374] rounded-2xl overflow-hidden bg-[#0B1524] shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#182C48] border-b border-[#2E4374] text-[#93C5FD] font-semibold">
                          <th className="py-3 px-4">Date &amp; ID</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Description / Manuscrit</th>
                          <th className="py-3 px-4 text-right">Montant (Pages)</th>
                          <th className="py-3 px-4 text-right">Solde Après</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2E4374] bg-[#0B1524]">
                        {filteredTransactions.map((tx) => {
                          const isDebit = tx.montant < 0;
                          return (
                            <tr key={tx.id} className="hover:bg-[#132238] transition-colors">
                              <td className="py-3 px-4 space-y-0.5">
                                <span className="font-ibm-mono font-medium text-white block">
                                  {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="font-ibm-mono text-[10px] text-[#93C5FD]">
                                  {tx.id}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-ibm-mono ${
                                    tx.type === 'generation'
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                                      : tx.type === 'bonus'
                                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600'
                                      : 'bg-blue-950/80 text-blue-300 border border-blue-600'
                                  }`}
                                >
                                  {tx.type === 'generation' && <ArrowDownRight className="w-3 h-3 text-amber-400" />}
                                  {tx.type === 'bonus' && <Gift className="w-3 h-3 text-emerald-400" />}
                                  {tx.type === 'achat' && <ShoppingBag className="w-3 h-3 text-blue-400" />}
                                  <span>{tx.type}</span>
                                </span>
                              </td>
                              <td className="py-3 px-4 text-white">
                                <p className="font-medium">{tx.description || 'Opération de crédits'}</p>
                                {tx.ebook_id && (
                                  <span className="font-ibm-mono text-[10px] text-[#93C5FD]">
                                    Réf: {tx.ebook_id}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span
                                  className={`font-ibm-mono font-bold text-sm ${
                                    isDebit ? 'text-white' : 'text-emerald-400'
                                  }`}
                                >
                                  {isDebit ? '' : '+'}
                                  {tx.montant} p
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span
                                  className="font-ibm-mono font-semibold text-white"
                                >
                                  {tx.balance_after !== undefined ? `${tx.balance_after} p` : '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Future credit purchase schema structure */
            <div className="space-y-6">
              
              <div className="p-4 bg-[#0B1524] border border-[#2E4374] rounded-2xl flex items-start space-x-3 text-xs text-[#93C5FD]">
                <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white uppercase tracking-wider block">
                    Architecture Préparatoire d'Achat (Prête pour Stripe)
                  </span>
                  <p className="leading-relaxed">
                    Ce catalogue formalise le schéma de données pour les futurs achats de crédits supplémentaires. 
                    Les structures de commandes (<code>CreditPurchaseOrderSchema</code>) et les SKUs sont déclarés, 
                    prêts à être raccordés aux webhooks de la passerelle de paiement.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATALOGUE_CREDIT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-5 rounded-2xl border border-[#2E4374] bg-[#0B1524] hover:bg-[#182C48] hover:border-[#60A5FA] transition-all flex flex-col justify-between space-y-4 shadow-xs text-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-ibm-mono text-[10px] font-bold uppercase tracking-wider text-[#60A5FA] px-2 py-0.5 bg-[#1B2A4A] rounded-md border border-[#2E4374]">
                          SKU: {pack.sku}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 font-semibold">
                          {pack.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display-title text-base font-bold text-white">{pack.nom}</h4>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="font-display-title text-2xl font-bold text-white font-ibm-mono">
                            {pack.prix_eur} €
                          </span>
                          <span className="text-xs text-[#93C5FD]">/ {pack.pages} pages</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#93C5FD] font-serif-book italic">
                        {pack.description}
                      </p>

                      <ul className="text-xs text-[#BFDBFE] space-y-1.5 pt-2 border-t border-[#2E4374]">
                        {pack.fonctionnalites.map((feat, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#2E4374]">
                      <button
                        type="button"
                        onClick={() => handleTestPrepareOrder(pack)}
                        className="w-full py-2 bg-[#1B2A4A] hover:bg-[#25395F] text-white rounded-xl text-xs font-semibold border border-[#2E4374] transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Tester Préparation Commande</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {onAddBonusCredits && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddBonusCredits(pack.pages);
                            setPreparedOrderInfo(`Simulation réussie : +${pack.pages} pages créditées sous le type « bonus/achat » avec transaction enregistrée.`);
                          }}
                          className="w-full py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3 text-[#BFDBFE]" />
                          <span>Créditer en mode test (+{pack.pages}p)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2E4374] bg-[#0B1524] flex items-center justify-between text-xs text-[#93C5FD]">
          <span className="font-ibm-mono">Table `credit_transactions` synchronisée</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
