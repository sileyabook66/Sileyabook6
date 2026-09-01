import React from 'react';
import { BookOpen, Feather, Tag, Sparkles } from 'lucide-react';

interface SileyaBottomNavProps {
  activeView: 'dashboard' | 'studio' | 'viewer' | 'tarifs';
  onNavigateToDashboard: () => void;
  onNavigateToStudio: () => void;
  onNavigateToTarifs?: () => void;
  onOpenUpgrade: () => void;
}

export const SileyaBottomNav: React.FC<SileyaBottomNavProps> = ({
  activeView,
  onNavigateToDashboard,
  onNavigateToStudio,
  onNavigateToTarifs,
  onOpenUpgrade,
}) => {
  return (
    <nav 
      aria-label="Navigation principale mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 w-full flex justify-around items-center py-2 px-3 bg-white/95 backdrop-blur-md border-t border-[#E7EAF3] shadow-lg z-40 safe-bottom"
    >
      {/* Tab 1: Ma Bibliothèque / Dashboard */}
      <button
        type="button"
        onClick={onNavigateToDashboard}
        className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-2 rounded-xl transition-all duration-300 active:scale-95 ${
          activeView === 'dashboard'
            ? 'text-[#1877F2] font-bold'
            : 'text-[#8089A6] hover:text-[#14161F]'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors duration-300 ${
          activeView === 'dashboard' ? 'bg-[#EEF2FF] text-[#1877F2]' : 'text-[#8089A6]'
        }`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="font-poppins text-[10px] tracking-tight mt-0.5 truncate max-w-[80px]">
          Bibliothèque
        </span>
      </button>

      {/* Tab 2: Studio / Nouveau Manuscrit (Highlighted Center Tab) */}
      <button
        type="button"
        onClick={onNavigateToStudio}
        className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-2 rounded-xl transition-all duration-300 active:scale-95 ${
          activeView === 'studio' || activeView === 'viewer'
            ? 'text-[#1877F2] font-bold'
            : 'text-[#8089A6] hover:text-[#14161F]'
        }`}
      >
        <div className={`p-1.5 rounded-full transition-all duration-300 shadow-xs ${
          activeView === 'studio' || activeView === 'viewer'
            ? 'bg-[#1877F2] text-white ring-2 ring-[#1877F2]/30 scale-105'
            : 'bg-[#F6F8FF] text-[#8089A6] border border-[#E7EAF3]'
        }`}>
          <Feather className="w-4 h-4" />
        </div>
        <span className="font-poppins text-[10px] tracking-tight mt-0.5 font-semibold">
          Studio
        </span>
      </button>

      {/* Tab 3: Offres & Tarifs / Compte */}
      <button
        type="button"
        onClick={onNavigateToTarifs || onOpenUpgrade}
        className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-2 rounded-xl transition-all duration-300 active:scale-95 ${
          activeView === 'tarifs'
            ? 'text-[#1877F2] font-bold'
            : 'text-[#8089A6] hover:text-[#14161F]'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors duration-300 ${
          activeView === 'tarifs' ? 'bg-[#EEF2FF] text-[#1877F2]' : 'text-[#8089A6]'
        }`}>
          <Tag className="w-5 h-5" />
        </div>
        <span className="font-poppins text-[10px] tracking-tight mt-0.5 truncate max-w-[80px]">
          Tarifs (FCFA)
        </span>
      </button>
    </nav>
  );
};

