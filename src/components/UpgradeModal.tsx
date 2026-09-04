import React, { useState } from 'react';
import { X, Check, CheckCircle2, AlertTriangle, ExternalLink, Smartphone, Feather, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { PricingScreen, SILEYABOOK_OFFERS, PricingOffer } from './PricingScreen';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onAddCredits: (amount: number, type?: 'bonus' | 'achat', description?: string) => void;
  onNavigate?: (route: string) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddCredits,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleOfferPurchased = (offer: PricingOffer, orderId: string) => {
    onAddCredits(offer.equivalentPages, 'achat', `Formule Sileyabook ${offer.titre} [${orderId}]`);
  };

  const handleNavigateInternal = (route: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(route);
    } else if (typeof window !== 'undefined') {
      window.location.pathname = route;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#132238] border border-[#2E4374] rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] border border-[#2E4374] text-white flex items-center justify-center shadow-xs">
              <Feather className="w-5 h-5 text-[#60A5FA]" />
            </div>
            <div>
              <h3 className="font-display-title text-base sm:text-lg font-bold text-white">
                Formules &amp; Tarifs Sileyabook
              </h3>
              <p className="text-xs text-[#93C5FD] font-serif-book">
                Tarifs fixes à l'ouvrage • Sans abonnement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#93C5FD] hover:text-white hover:bg-[#1B2A4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          <PricingScreen
            profile={profile}
            onNavigate={handleNavigateInternal}
            onOfferPurchased={handleOfferPurchased}
            onClose={onClose}
            isModal={true}
          />
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 border-t border-[#2E4374] bg-[#0B1524] flex items-center justify-between text-xs text-[#93C5FD]">
          <span className="font-mono text-[11px] text-[#60A5FA] font-bold">
            Paiements sécurisés par Mobile Money (Guinée &amp; Afrique Francophone)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B2A4A] text-white border border-[#2E4374] rounded-xl font-semibold hover:bg-[#25395F] transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
