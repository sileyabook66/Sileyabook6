import React from 'react';
import { Feather, Shield, Scale, RefreshCcw, Lock, FileText, Mail, MessageSquare, Tag } from 'lucide-react';

interface SiteFooterProps {
  onNavigate: (route: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#FAF6EE] border-t border-[#E8DFCC] text-[#6E614E] font-work-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#E5DAC8]">
          
          {/* Col 1 : Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] text-[#F8F5EE] flex items-center justify-center shadow-xs">
                <Feather className="w-4 h-4 text-[#93C5FD]" />
              </div>
              <span className="font-display-title text-lg font-bold text-[#1C1A17] tracking-wider">
                SILEYABOOK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#736551] max-w-md leading-relaxed">
              Plateforme d'édition d'eBooks professionnels et de mise en page automatisée haute fidélité. Édité par l'entreprise <strong>SECRETS DIVIN</strong> (RCCM : GN.TCC.2026.A.05915).
            </p>
            <div className="flex items-center space-x-3 pt-1 text-xs text-[#8A7D6B]">
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Formats E-pub 3.0 &amp; PDF Haute Définition</span>
              </span>
            </div>
          </div>

          {/* Col 2 : Legal Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1A17] font-mono">
              Informations Légales
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/mentions-legales')}
                  className="hover:text-[#1B2A4A] transition-colors flex items-center space-x-1.5 text-left group"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2E4374] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">Mentions légales</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/cgu')}
                  className="hover:text-[#1B2A4A] transition-colors flex items-center space-x-1.5 text-left group"
                >
                  <Scale className="w-3.5 h-3.5 text-[#2E4374] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">Conditions Générales (CGU / CGV)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/remboursement')}
                  className="hover:text-[#1B2A4A] transition-colors flex items-center space-x-1.5 text-left group"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-[#2E4374] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">Politique de remboursement</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/confidentialite')}
                  className="hover:text-[#1B2A4A] transition-colors flex items-center space-x-1.5 text-left group"
                >
                  <Lock className="w-3.5 h-3.5 text-[#2E4374] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">Politique de confidentialité</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 : Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1A17] font-mono">
              Support &amp; Tarifs
            </h4>
            <div className="space-y-2 text-xs text-[#5C503E]">
              <div>
                <button
                  onClick={() => onNavigate('/tarifs')}
                  className="inline-flex items-center space-x-1.5 text-[#1B2A4A] hover:underline font-semibold"
                >
                  <Tag className="w-3.5 h-3.5 text-[#2E4374]" />
                  <span>Consulter nos 3 offres (dès 1000 FCFA)</span>
                </button>
              </div>
              <div>
                <a
                  href="mailto:contact@sileyabook.com"
                  className="inline-flex items-center space-x-1.5 text-[#1B2A4A] hover:underline font-medium"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>contact@sileyabook.com</span>
                </a>
              </div>
              <div>
                <a
                  href="https://wa.me/224611080516"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-emerald-800 hover:underline font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WhatsApp : +224 611 08 05 16</span>
                </a>
              </div>
              <p className="text-[11px] text-[#8C7F6D] pt-1">
                Conakry, République de Guinée • Assistance créateurs 7j/7
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7D6C]">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} SileyaBook. Tous droits réservés.</span>
            <span className="hidden sm:inline">•</span>
            <span>Édité par SECRETS DIVIN</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('/tarifs')}
              className="hover:text-[#1B2A4A] transition-colors font-semibold text-[#1B2A4A]"
            >
              Offres dès 1 000 FCFA
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('/cgu')}
              className="hover:text-[#1B2A4A] transition-colors"
            >
              Conditions Générales
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('/confidentialite')}
              className="hover:text-[#1B2A4A] transition-colors"
            >
              Confidentialité
            </button>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#1C1A17] transition-colors text-[#5C503E] font-semibold"
            >
              Haut ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
