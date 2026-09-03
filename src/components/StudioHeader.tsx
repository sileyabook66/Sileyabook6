import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  PlusCircle, 
  History, 
  Feather, 
  ShieldCheck, 
  Key, 
  LayoutDashboard, 
  PenTool,
  Layers,
  Tag
} from 'lucide-react';
import { UserProfile } from '../types';

interface StudioHeaderProps {
  profile: UserProfile;
  activeView: 'dashboard' | 'studio' | 'viewer' | 'tarifs';
  onNavigateToDashboard: () => void;
  onNavigateToStudio: () => void;
  onNavigateToTarifs?: () => void;
  onOpenActiveEbook?: () => void;
  onOpenUpgrade: () => void;
  onOpenLogs: () => void;
  onOpenDraftsList: () => void;
  hasDedicatedKey?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  profile,
  activeView,
  onNavigateToDashboard,
  onNavigateToStudio,
  onNavigateToTarifs,
  onOpenActiveEbook,
  onOpenUpgrade,
  onOpenLogs,
  onOpenDraftsList,
  hasDedicatedKey,
}) => {
  return (
    <header className="w-full bg-white border-b border-[#E7EAF3] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Route */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <button
              onClick={onNavigateToDashboard}
              className="flex items-center space-x-3 text-left group min-w-0"
              title="Retour au Tableau de Bord (/dashboard)"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B4DE8] to-[#1B36C9] text-white flex items-center justify-center shadow-sonic border border-[#2B4DE8]/30 group-hover:scale-105 transition-all shrink-0">
                <Feather className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-poppins text-lg sm:text-xl font-bold tracking-tight text-[#14161F] group-hover:text-[#2B4DE8] transition-colors">
                    SileyaBook
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-semibold bg-[#EEF2FF] text-[#2B4DE8] border border-[#2B4DE8]/20">
                    AI Studio
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-[#8089A6] font-poppins truncate">
                  <span className="font-data-mono text-[10px] text-[#2B4DE8] font-semibold">
                    {activeView === 'dashboard' ? '/dashboard' : activeView === 'studio' ? '/studio/nouveau' : activeView === 'tarifs' ? '/tarifs' : '/studio/manuscrit'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {activeView === 'dashboard' ? 'Tableau de bord' : activeView === 'studio' ? 'Générateur de Manuscrit' : activeView === 'tarifs' ? 'Tarifs & Offres' : 'Lecteur & Édition'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F6F8FF] p-1 rounded-xl border border-[#E7EAF3]">
            <button
              onClick={onNavigateToDashboard}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-all ${
                activeView === 'dashboard'
                  ? 'bg-white text-[#2B4DE8] shadow-xs font-bold border border-[#E7EAF3]'
                  : 'text-[#4A4E5A] hover:text-[#2B4DE8]'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${activeView === 'dashboard' ? 'text-[#2B4DE8]' : 'text-[#8089A6]'}`} />
              <span>Tableau de bord</span>
            </button>

            {onOpenActiveEbook && activeView === 'viewer' && (
              <button
                onClick={onOpenActiveEbook}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-poppins bg-[#2B4DE8] text-white shadow-sonic transition-all"
                title="Consulter le manuscrit en cours"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Manuscrit Actif</span>
              </button>
            )}

            <button
              onClick={onNavigateToStudio}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-all ${
                activeView === 'studio'
                  ? 'bg-white text-[#2B4DE8] shadow-xs font-bold border border-[#E7EAF3]'
                  : 'text-[#4A4E5A] hover:text-[#2B4DE8]'
              }`}
            >
              <PenTool className={`w-3.5 h-3.5 ${activeView === 'studio' ? 'text-[#2B4DE8]' : 'text-[#8089A6]'}`} />
              <span>Nouveau Manuscrit</span>
            </button>

            {onNavigateToTarifs && (
              <button
                onClick={onNavigateToTarifs}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-poppins transition-all ${
                  activeView === 'tarifs'
                    ? 'bg-white text-[#2B4DE8] shadow-xs font-bold border border-[#E7EAF3]'
                    : 'text-[#4A4E5A] hover:text-[#2B4DE8]'
                }`}
              >
                <Tag className={`w-3.5 h-3.5 ${activeView === 'tarifs' ? 'text-[#2B4DE8]' : 'text-[#8089A6]'}`} />
                <span>Tarifs (FCFA)</span>
              </button>
            )}
          </nav>

          {/* Actions & Balance Quota */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Mobile Nav Switcher */}
            <div className="flex md:hidden items-center space-x-1 bg-[#F6F8FF] p-1 rounded-lg border border-[#E7EAF3]">
              <button
                onClick={onNavigateToDashboard}
                className={`p-1.5 rounded-md text-xs ${activeView === 'dashboard' ? 'bg-white text-[#2B4DE8] shadow-xs' : 'text-[#8089A6]'}`}
                title="Tableau de bord"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
              {onOpenActiveEbook && activeView === 'viewer' && (
                <button
                  onClick={onOpenActiveEbook}
                  className="p-1.5 rounded-md text-xs bg-[#2B4DE8] text-white shadow-xs"
                  title="Manuscrit Actif"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onNavigateToStudio}
                className={`p-1.5 rounded-md text-xs ${activeView === 'studio' ? 'bg-white text-[#2B4DE8] shadow-xs' : 'text-[#8089A6]'}`}
                title="Nouveau Manuscrit"
              >
                <PenTool className="w-4 h-4" />
              </button>
              {onNavigateToTarifs && (
                <button
                  onClick={onNavigateToTarifs}
                  className={`p-1.5 rounded-md text-xs ${activeView === 'tarifs' ? 'bg-white text-[#2B4DE8] shadow-xs' : 'text-[#8089A6]'}`}
                  title="Tarifs"
                >
                  <Tag className="w-4 h-4 text-[#2B4DE8]" />
                </button>
              )}
            </div>

            {/* Dedicated Engine badge */}
            <div 
              title="Moteur Sileyabook connecté et sécurisé" 
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs bg-[#EEF2FF] text-[#2B4DE8] border border-[#2B4DE8]/20 font-data-mono font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2B4DE8]" />
              <span>SILEYA ENGINE</span>
            </div>

            {/* Logs button */}
            <button
              onClick={onOpenLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-poppins text-[#4A4E5A] bg-[#F6F8FF] hover:bg-[#EEF2FF] border border-[#E7EAF3] hover:border-[#2B4DE8]/30 transition-colors"
              title="Consulter le journal des compositions"
            >
              <History className="w-3.5 h-3.5 text-[#8089A6]" />
              <span className="hidden sm:inline">Journal</span>
            </button>

            {/* Quick Pricing / Offers Action Button in Sonic Vibrant Orange */}
            <button
              onClick={onOpenUpgrade}
              className="inline-flex items-center space-x-1.5 px-3 lg:px-4 py-2 bg-gradient-to-r from-[#FF7F00] to-[#F26A00] hover:from-[#F26A00] hover:to-[#E05E00] text-white rounded-full text-xs font-poppins font-bold shadow-sonic-orange hover:scale-105 transition-all shrink-0"
              title="Voir les offres Sileyabook (à partir de 1 000 FCFA)"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Nos Offres</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
