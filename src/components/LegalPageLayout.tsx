import React from 'react';
import { 
  Feather, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Scale, 
  RefreshCcw, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type LegalRoute = 'mentions-legales' | 'cgu' | 'remboursement' | 'confidentialite';

interface LegalPageLayoutProps {
  currentRoute: LegalRoute;
  title: string;
  subtitle?: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const LEGAL_PAGES_META: {
  id: LegalRoute;
  path: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'mentions-legales',
    path: '/mentions-legales',
    title: 'Mentions Légales',
    shortTitle: 'Mentions',
    icon: FileText,
    description: 'Identification de l\'éditeur SECRETS DIVIN et hébergement',
  },
  {
    id: 'cgu',
    path: '/cgu',
    title: 'Conditions Générales (CGU/CGV)',
    shortTitle: 'CGU & CGV',
    icon: Scale,
    description: 'Règles d\'utilisation, rédaction, propriété et tarifs',
  },
  {
    id: 'remboursement',
    path: '/remboursement',
    title: 'Politique de Remboursement',
    shortTitle: 'Remboursement',
    icon: RefreshCcw,
    description: 'Conditions de rétractation et garanties techniques',
  },
  {
    id: 'confidentialite',
    path: '/confidentialite',
    title: 'Politique de Confidentialité',
    shortTitle: 'Confidentialité',
    icon: Lock,
    description: 'Traitement des données, Gemini API et droits utilisateurs',
  },
];

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  currentRoute,
  title,
  subtitle,
  onNavigate,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#22211E] font-work-sans antialiased flex flex-col selection:bg-[#E8DCC4] selection:text-[#1F1E1B]">
      
      {/* Top Banner & Header */}
      <header className="w-full bg-[#FCFBF7] border-b border-[#E8E1D3] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo SileyaBook */}
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-3 text-left group"
              title="Retour à l'accueil SileyaBook"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-[#F8F5EE] flex items-center justify-center shadow-xs border border-[#2E4374] group-hover:border-[#93C5FD]/60 transition-colors">
                <Feather className="w-5 h-5 text-[#93C5FD]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display-title text-base sm:text-lg font-bold tracking-wider text-[#1C1A17] group-hover:text-[#1B2A4A] transition-colors">
                    SILEYABOOK
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF3FB] text-[#1B2A4A] border border-[#BFDBFE] uppercase tracking-wider font-ibm-mono">
                    Légal
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7060] font-sans">
                  Plateforme d'édition & création d'eBooks
                </p>
              </div>
            </button>

            {/* Quick Navigation Back to Studio / Dashboard */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onNavigate('/dashboard')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#4A4235] bg-[#F5F0E6] hover:bg-[#EAE2D4] border border-[#DED4C2] transition-colors shadow-2xs"
              >
                <span>Accéder au Dashboard</span>
              </button>
              
              <button
                onClick={() => onNavigate('/studio')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1B2A4A] hover:bg-[#2E4374] text-[#FAF7F0] shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#93C5FD]" />
                <span>Créer un eBook</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Breadcrumbs & Tab Bar */}
      <div className="w-full bg-[#FAF5EB] border-b border-[#E5DBCA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-[#7A6F5E]">
              <button 
                onClick={() => onNavigate('/')} 
                className="hover:text-[#1B2A4A] transition-colors flex items-center space-x-1 font-medium"
              >
                <span>SileyaBook</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#A69B8A]" />
              <span className="font-semibold text-[#29241E]">{title}</span>
            </div>

            {/* Navigation pills between the 4 legal pages */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {LEGAL_PAGES_META.map((item) => {
                const isActive = currentRoute === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.path)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#1B2A4A] text-[#FAF7F0] shadow-2xs'
                        : 'bg-[#F0E8D8] text-[#5C503E] hover:bg-[#E5DBCA] hover:text-[#1C1A17]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#93C5FD]' : 'text-[#1B2A4A]'}`} />
                    <span>{item.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs text-[#7A6F5E] hover:text-[#8C2D19] mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l'application SileyaBook</span>
        </button>

        {/* Paper Container - Blue Card */}
        <article className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-8 paper-shadow">
          
          {/* Header of document */}
          <div className="border-b border-[#BFDBFE] pb-6 space-y-3 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1B2A4A] border border-[#93C5FD] text-xs font-medium font-ibm-mono mx-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Document Officiel SileyaBook • Entité SECRETS DIVIN</span>
            </div>
            
            <h1 className="font-display-title text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight text-center">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm sm:text-base text-[#5A6D88] font-work-sans leading-relaxed text-center max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#5A6D88] pt-2 font-ibm-mono">
              <span>Dernière mise à jour : Août 2026</span>
              <span>•</span>
              <span>République de Guinée (RCCM GN.TCC.2026.A.05915)</span>
            </div>
          </div>

          {/* Body Content - Work Sans */}
          <div className="font-work-sans text-[#1E293B] text-sm sm:text-base leading-relaxed space-y-8">
            {children}
          </div>

          {/* Document Footer Note */}
          <div className="mt-12 pt-6 border-t border-[#BFDBFE] bg-[#EFF5FC] -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 lg:-mx-12 lg:-mb-12 p-6 sm:p-8 rounded-b-2xl sm:rounded-b-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5A6D88]">
            <div className="space-y-1">
              <span className="font-bold text-[#0F172A] block">Une question concernant nos mentions ou conditions ?</span>
              <p className="text-[#5A6D88]">
                Notre équipe est à votre écoute par email (<a href="mailto:contact@sileyabook.com" className="text-[#1B2A4A] underline font-medium">contact@sileyabook.com</a>) ou via WhatsApp (<a href="https://wa.me/224611080516" target="_blank" rel="noopener noreferrer" className="text-[#1B2A4A] underline font-medium">+224 611 08 05 16</a>).
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-3 py-1.5 rounded-lg bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1B2A4A] text-xs font-semibold transition-colors"
              >
                Haut de page ↑
              </button>
            </div>
          </div>

        </article>

      </main>

    </div>
  );
};
