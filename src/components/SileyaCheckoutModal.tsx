import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface SileyaCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment?: (pagesAdded: number, amountPaidFcfa: number) => void;
  profile?: UserProfile;
}

export const SileyaCheckoutModal: React.FC<SileyaCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccessPayment,
  profile,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      if (onSuccessPayment) {
        onSuccessPayment(100, 3500);
      }

      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FBF8FC] text-[#1B1B1E] w-full max-w-[720px] min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-staggered-fade-in border border-[#C5C6CF]/40">
        
        {/* Transactional Header */}
        <header className="sticky top-0 w-full z-20 bg-[#FBF8FC]/95 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-6 editorial-divider">
          <button
            onClick={onClose}
            aria-label="Retour"
            className="p-2 -ml-2 rounded-full hover:bg-[#F5F3F6] transition-colors text-[#041534] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="font-fraunces text-xl font-bold text-[#041534] tracking-tight">
            Paiement
          </h1>
          
          <div className="w-8"></div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 flex flex-col px-4 sm:px-8 pt-6 pb-28 max-w-[720px] mx-auto w-full">
          
          {paymentSuccess ? (
            <div className="my-auto py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-fraunces text-2xl font-bold text-[#041534]">
                Paiement validé avec succès
              </h2>
              <p className="font-work-sans text-sm text-[#595E6D]">
                Votre Pack Édition Unique (+100 pages) a été crédité sur votre compte SileyaBook.
              </p>
            </div>
          ) : (
            <>
              {/* Offer Summary Card */}
              <section className="bg-white border border-[#1B2A4A]/10 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden text-center">
                <div className="relative z-10">
                  <p className="font-label-caps text-xs text-[#595E6D] mb-1 uppercase tracking-widest text-center">
                    Votre sélection
                  </p>
                  <h2 className="font-fraunces text-2xl font-bold text-[#041534] mb-2 text-center">
                    Pack Édition Unique
                  </h2>
                  
                  <div className="my-4 editorial-divider"></div>

                  <div className="flex items-baseline justify-center gap-2 mb-6 text-center">
                    <span className="font-fraunces text-4xl font-bold text-[#041534]">3 500</span>
                    <span className="font-fraunces text-xl text-[#041534] font-semibold">FCFA</span>
                    <span className="text-xs text-[#595E6D] ml-2">(~5,35 €)</span>
                  </div>

                  <ul className="space-y-3 font-work-sans text-sm text-left">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C98A2C] mt-0.5 shrink-0" />
                      <span className="text-[#1B1B1E] font-medium">1 eBook ou livre broché complet (jusqu'à 100 pages)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C98A2C] mt-0.5 shrink-0" />
                      <span className="text-[#1B1B1E]">Couverture complète KDP (recto, tranche, verso)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C98A2C] mt-0.5 shrink-0" />
                      <span className="text-[#1B1B1E]">Export PDF haute définition &amp; EPUB 3.0 fluide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C98A2C] mt-0.5 shrink-0" />
                      <span className="text-[#1B1B1E]">Accès et téléchargements illimités</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Simulated Payment Form */}
              <section className="mb-8">
                <h3 className="font-fraunces text-lg font-bold text-[#041534] mb-4 text-center">
                  Informations de Facturation
                </h3>
                <form id="checkout-form" onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="flex flex-col">
                    <label className="font-work-sans text-xs font-semibold text-[#595E6D] mb-1" htmlFor="email">
                      Adresse Email
                    </label>
                    <input
                      className="editorial-input bg-transparent py-2 font-work-sans text-base text-[#041534] focus:border-[#041534]"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auteur@sileyabook.com"
                      type="email"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-work-sans text-xs font-semibold text-[#595E6D] mb-1" htmlFor="phone">
                      Numéro de téléphone (Mobile Money / Orange / Wave)
                    </label>
                    <div className="flex items-end">
                      <span className="font-work-sans text-base text-[#041534] pb-2 pr-2 editorial-input border-b border-r-0 border-t-0 border-l-0 rounded-none">
                        +221
                      </span>
                      <input
                        className="editorial-input bg-transparent py-2 font-work-sans text-base text-[#041534] flex-1 border-b border-l-0 border-t-0 border-r-0 rounded-none focus:ring-0"
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="77 000 00 00"
                        type="tel"
                      />
                    </div>
                  </div>
                </form>
              </section>
            </>
          )}

        </main>

        {/* Fixed Bottom Action Area */}
        {!paymentSuccess && (
          <div className="fixed bottom-0 left-0 w-full bg-[#FBF8FC]/95 backdrop-blur-md border-t border-[#C5C6CF]/40 p-4 pb-6 z-30">
            <div className="max-w-[720px] mx-auto w-full">
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[#E7C08B] hover:bg-[#FFDDB0] text-[#211300] font-fraunces text-base font-bold py-3.5 rounded-xl shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <span>Régler la commande (3 500 FCFA)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center font-label-caps text-[11px] text-[#595E6D] mt-3 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Paiement sécurisé via Mobile Money &amp; Cartes Bancaires
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
