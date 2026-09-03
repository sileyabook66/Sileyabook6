import React, { useState, useEffect } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { StudioSourceSelector } from './components/StudioSourceSelector';
import { ManuscriptProgress } from './components/ManuscriptProgress';
import { ManuscriptViewer } from './components/ManuscriptViewer';
import { CreatorDashboard } from './components/CreatorDashboard';
import { GenerationLogsModal } from './components/GenerationLogsModal';
import { UpgradeModal } from './components/UpgradeModal';
import { DraftsListModal } from './components/DraftsListModal';
import { SiteFooter } from './components/SiteFooter';
import { PricingScreen, PricingOffer } from './components/PricingScreen';
import { SileyaCoverSelectorModal } from './components/SileyaCoverSelectorModal';
import { SileyaCheckoutModal } from './components/SileyaCheckoutModal';
import { SileyaBottomNav } from './components/SileyaBottomNav';
import { MentionsLegalesPage } from './components/legal/MentionsLegalesPage';
import { CguPage } from './components/legal/CguPage';
import { RemboursementPage } from './components/legal/RemboursementPage';
import { ConfidentialitePage } from './components/legal/ConfidentialitePage';
import { storage } from './lib/storage';
import { Ebook, GenerationLog, SourceInputData, UserProfile, CreditTransaction } from './types';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [ebooks, setEbooks] = useState<Ebook[]>(() => storage.getEbooks());
  const [logs, setLogs] = useState<GenerationLog[]>(() => storage.getGenerationLogs());
  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => storage.getTransactions());
  
  // URL Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'studio' | 'tarifs'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '/';
      if (path === '/tarifs' || path === '/prix') return 'tarifs';
      if (path === '/studio' || path.startsWith('/studio')) return 'studio';
      return 'dashboard';
    }
    return 'dashboard';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSourceData, setActiveSourceData] = useState<SourceInputData | null>(null);
  const [activeEbook, setActiveEbook] = useState<Ebook | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '/';
      if (path === '/tarifs' || path === '/prix') return null;
      const urlParams = new URLSearchParams(window.location.search);
      const ebookParam = urlParams.get('ebook');
      const all = storage.getEbooks();
      if (ebookParam) {
        const found = all.find((b) => b.id === ebookParam);
        if (found) return found;
      }
      return null;
    }
    return null;
  });
  
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasDedicatedKey, setHasDedicatedKey] = useState(true);

  // Synchronize browser history and popstate for deep-linking
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      if (path === '/tarifs' || path === '/prix') {
        setActiveTab('tarifs');
        setActiveEbook(null);
      } else if (path === '/studio' || path.startsWith('/studio')) {
        setActiveTab('studio');
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Check server key status
    fetch('/api/studio/status')
      .then((res) => res.json())
      .then((data) => {
        setHasDedicatedKey(data.hasDedicatedKey || data.hasDefaultKey);
      })
      .catch(() => {});
  }, []);

  // Support direct ebook opening via URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ebookParam = urlParams.get('ebook');
      if (ebookParam) {
        const found = ebooks.find((b) => b.id === ebookParam);
        if (found) {
          setActiveEbook(found);
        }
      }
    }
  }, [ebooks]);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      if (path === '/tarifs' || path === '/prix') {
        setActiveTab('tarifs');
        setActiveEbook(null);
      } else if (path === '/studio' || path.startsWith('/studio')) {
        setActiveTab('studio');
      } else if (path === '/dashboard' || path === '/' || path === '/vitrine' || path === '/maquette') {
        setActiveTab('dashboard');
        setActiveEbook(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddCredits = (amount: number, type: 'bonus' | 'achat' = 'bonus', description?: string) => {
    const updated = storage.addCredits(amount, { type, description });
    setProfile(updated);
    setTransactions(storage.getTransactions());
  };

  const handleGenerate = async (data: SourceInputData) => {
    setErrorMessage(null);
    const estimatedPages = data.estimatedPages || 35;

    // Pre-flight Balance Verification
    if (profile.credits_pages < estimatedPages) {
      setErrorMessage(`Solde insuffisant : il vous reste ${profile.credits_pages} pages de vélin, alors que ${estimatedPages} pages sont requises.`);
      setIsUpgradeOpen(true);
      return;
    }

    setActiveSourceData(data);
    setIsGenerating(true);
    setActiveEbook(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/studio/generate-ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          profileId: profile.id,
          creditsAvailable: profile.credits_pages,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        if (response.status === 402) {
          throw new Error(errorJson?.message || `Solde insuffisant (${profile.credits_pages}p restantes).`);
        }
        throw new Error(errorJson?.message || `Erreur serveur (${response.status}) lors de la composition.`);
      }

      const generatedData = await response.json();

      const elapsed = Date.now() - startTime;
      if (elapsed < 3200) {
        await new Promise((r) => setTimeout(r, 3200 - elapsed));
      }

      const actualPages = generatedData.credits_consommes || generatedData.contenu?.metadata?.pages_estimees || estimatedPages;
      const ebookId = `ebk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const nowIso = new Date().toISOString();

      const sourceDetail = data.sourceType === 'texte_utilisateur'
        ? `Texte brut auteur (${data.rawUserText?.split(/\s+/).filter(Boolean).length || 0} mots)`
        : (data.youtubeUrl || data.fileName || data.promptText?.slice(0, 80) || "Source personnalisée");

      const newEbook: Ebook = {
        id: ebookId,
        titre: generatedData.titre || data.userBookTitle || "Manuscrit sans titre",
        sous_titre: generatedData.sous_titre || data.userBookSubtitle || "",
        description: generatedData.description || "",
        statut: 'draft',
        source_type: data.sourceType,
        source_detail: sourceDetail,
        plan: generatedData.plan || [],
        contenu: generatedData.contenu,
        credits_consommes: actualPages,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const deductionDesc = data.sourceType === 'texte_utilisateur'
        ? `Mise en page texte auteur « ${newEbook.titre} »`
        : `Génération manuscrit « ${newEbook.titre} »`;

      const deduction = storage.deductCredits(actualPages, {
        ebookId: newEbook.id,
        description: deductionDesc,
      });

      if (!deduction.success) {
        console.warn("Avertissement de décompte:", deduction.error);
      }

      setProfile(storage.getProfile());
      setTransactions(storage.getTransactions());

      storage.saveEbook(newEbook);
      setEbooks(storage.getEbooks());

      const newLog: GenerationLog = {
        id: `log-${Date.now()}`,
        ebook_id: ebookId,
        ebook_titre: newEbook.titre,
        date: nowIso,
        source_type: data.sourceType,
        source_detail: newEbook.source_detail,
        pages_generees: actualPages,
        tokens_utilises: generatedData.meta?.tokensUsed || 3500,
        model_used: generatedData.meta?.modelUsed || "gemini-3.7-flash (GEMINI_API_KEY_STUDIO)",
        duration_ms: Date.now() - startTime,
        status: 'success',
      };

      storage.addGenerationLog(newLog);
      setLogs(storage.getGenerationLogs());

      setActiveEbook(newEbook);
    } catch (err: any) {
      console.error("Erreur de génération :", err);
      setErrorMessage(err.message || "Une erreur est survenue pendant la génération du manuscrit.");
      if (err.message?.includes("Solde")) {
        setIsUpgradeOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetToNew = () => {
    setActiveEbook(null);
    setActiveSourceData(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setActiveTab('studio');
    navigateTo('/studio');
  };

  const handleNavigateToDashboard = () => {
    setActiveEbook(null);
    setActiveSourceData(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setActiveTab('dashboard');
    navigateTo('/dashboard');
  };

  const handleNavigateToStudio = () => {
    setActiveEbook(null);
    setActiveSourceData(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setActiveTab('studio');
    navigateTo('/studio');
  };

  const handleNavigateToTarifs = () => {
    setActiveEbook(null);
    setActiveSourceData(null);
    setIsGenerating(false);
    setErrorMessage(null);
    setActiveTab('tarifs');
    navigateTo('/tarifs');
  };

  const handleOfferPurchased = (offer: PricingOffer, orderId: string) => {
    handleAddCredits(offer.equivalentPages, 'achat', `Formule Sileyabook ${offer.titre} [${orderId}]`);
  };

  // Check if current URL is one of the 4 public legal pages
  const isLegalMentions = currentPath === '/mentions-legales' || currentPath.startsWith('/mentions-legales');
  const isLegalCgu = currentPath === '/cgu' || currentPath.startsWith('/cgu');
  const isLegalRemboursement = currentPath === '/remboursement' || currentPath.startsWith('/remboursement');
  const isLegalConfidentialite = currentPath === '/confidentialite' || currentPath.startsWith('/confidentialite');
  const isTarifsPage = currentPath === '/tarifs' || currentPath === '/prix' || currentPath.startsWith('/tarifs') || currentPath.startsWith('/prix') || activeTab === 'tarifs';

  if (isLegalMentions) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F0]">
        <MentionsLegalesPage onNavigate={navigateTo} />
        <SiteFooter onNavigate={navigateTo} />
      </div>
    );
  }

  if (isLegalCgu) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F0]">
        <CguPage onNavigate={navigateTo} />
        <SiteFooter onNavigate={navigateTo} />
      </div>
    );
  }

  if (isLegalRemboursement) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F0]">
        <RemboursementPage onNavigate={navigateTo} />
        <SiteFooter onNavigate={navigateTo} />
      </div>
    );
  }

  if (isLegalConfidentialite) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F0]">
        <ConfidentialitePage onNavigate={navigateTo} />
        <SiteFooter onNavigate={navigateTo} />
      </div>
    );
  }

  const currentHeaderView = isGenerating
    ? 'studio'
    : activeEbook
    ? 'viewer'
    : isTarifsPage
    ? 'tarifs'
    : activeTab;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#22211E] flex flex-col antialiased selection:bg-[#E8DCC4] selection:text-[#1F1E1B]">
      
      {/* Studio Header Navigation */}
      <StudioHeader
        profile={profile}
        activeView={currentHeaderView}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToStudio={handleNavigateToStudio}
        onNavigateToTarifs={handleNavigateToTarifs}
        onOpenActiveEbook={() => {
          const all = storage.getEbooks();
          setActiveEbook(all[0] || null);
        }}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenDraftsList={() => setIsDraftsOpen(true)}
        hasDedicatedKey={hasDedicatedKey}
      />

      {/* Main Content Area with safe mobile bottom margin */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-8">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">Erreur de composition</span>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* View 1: Generating state (Manuscript animation) */}
        {isGenerating && activeSourceData && (
          <ManuscriptProgress sourceData={activeSourceData} />
        )}

        {/* View 2: Completed Manuscript Reader View */}
        {!isGenerating && activeEbook && (
          <ManuscriptViewer 
            ebook={activeEbook} 
            onNewGeneration={handleResetToNew}
            onNavigateToDashboard={handleNavigateToDashboard}
            onEbookUpdated={(updated) => {
              setActiveEbook(updated);
              setEbooks(storage.getEbooks());
            }}
          />
        )}

        {/* View 3: Tarifs & Formules Standalone Page */}
        {!isGenerating && !activeEbook && isTarifsPage && (
          <PricingScreen
            profile={profile}
            onNavigate={navigateTo}
            onOfferPurchased={handleOfferPurchased}
            onClose={handleNavigateToDashboard}
            isModal={false}
          />
        )}

        {/* View 4: Unified Dashboard & Showcase View (/dashboard or /) */}
        {!isGenerating && !activeEbook && !isTarifsPage && activeTab === 'dashboard' && (
          <CreatorDashboard
            profile={profile}
            ebooks={ebooks}
            logs={logs}
            transactions={transactions}
            onOpenNewStudio={handleNavigateToStudio}
            onOpenEbook={(ebook) => setActiveEbook(ebook)}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onOpenLogs={() => setIsLogsOpen(true)}
            onEbooksChanged={(updated) => setEbooks(updated)}
            onAddBonusCredits={handleAddCredits}
            onNavigateToTarifs={handleNavigateToTarifs}
          />
        )}

        {/* View 5: Initial Composition Form (/studio/nouveau) */}
        {!isGenerating && !activeEbook && !isTarifsPage && activeTab === 'studio' && (
          <StudioSourceSelector
            profile={profile}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onAddBonusCredits={handleAddCredits}
          />
        )}

      </main>

      {/* Modals & Drawers */}
      <GenerationLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        profile={profile}
        onAddCredits={handleAddCredits}
        onNavigate={navigateTo}
      />

      <SileyaCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        profile={profile}
        onSuccessPayment={(pagesAdded, amount) => {
          handleAddCredits(pagesAdded, 'achat', `Pack Édition Unique (+${pagesAdded} pages - ${amount} FCFA)`);
        }}
      />

      <SileyaCoverSelectorModal
        isOpen={isCoverGalleryOpen}
        onClose={() => setIsCoverGalleryOpen(false)}
        ebook={activeEbook || undefined}
        onSelectCover={(coverUrl, title) => {
          if (activeEbook) {
            const updated = { ...activeEbook, cover_theme: title || activeEbook.cover_theme };
            setActiveEbook(updated);
            storage.saveEbook(updated);
            setEbooks(storage.getEbooks());
          }
        }}
      />

      <DraftsListModal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        ebooks={ebooks}
        onSelectEbook={(eb) => setActiveEbook(eb)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <SileyaBottomNav
        activeView={currentHeaderView}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToStudio={handleNavigateToStudio}
        onNavigateToTarifs={handleNavigateToTarifs}
        onOpenUpgrade={() => setIsCheckoutOpen(true)}
      />

      {/* Universal Footer with legal and pricing links */}
      <SiteFooter onNavigate={navigateTo} />

    </div>
  );
}
