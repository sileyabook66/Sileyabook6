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
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase } from './lib/supabaseClient';
import { storage } from './lib/storage';
import { Ebook, GenerationLog, SourceInputData, UserProfile, CreditTransaction } from './types';
import { AlertCircle, Feather } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B4DE8] to-[#1B36C9] text-white flex items-center justify-center animate-pulse">
          <Feather className="w-5 h-5" />
        </div>
        <p className="text-xs text-[#8089A6] font-poppins">Chargement…</p>
      </div>
    </div>
  );
}

function StudioApp({ userId, currentPath, navigateTo }: { userId: string; currentPath: string; navigateTo: (path: string) => void }) {
  const { signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

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
  const [activeEbook, setActiveEbook] = useState<Ebook | null>(null);

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasDedicatedKey, setHasDedicatedKey] = useState(true);

  // Initial data load for the authenticated user
  useEffect(() => {
    let cancelled = false;
    setIsLoadingData(true);
    setDataError(null);

    Promise.all([
      storage.getProfile(userId),
      storage.getEbooks(userId),
      storage.getGenerationLogs(userId),
      storage.getTransactions(userId),
    ])
      .then(([p, eb, lg, tx]) => {
        if (cancelled) return;
        setProfile(p);
        setEbooks(eb);
        setLogs(lg);
        setTransactions(tx);

        // Support direct ebook opening via URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const ebookParam = urlParams.get('ebook');
        if (ebookParam) {
          const found = eb.find((b) => b.id === ebookParam);
          if (found) setActiveEbook(found);
        }
      })
      .catch((err) => {
        if (!cancelled) setDataError(err.message || 'Impossible de charger vos données.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Sync the active tab whenever the (lifted, App-level) currentPath changes
  useEffect(() => {
    if (currentPath === '/tarifs' || currentPath === '/prix') {
      setActiveTab('tarifs');
    } else if (currentPath === '/studio' || currentPath.startsWith('/studio')) {
      setActiveTab('studio');
    } else if (currentPath === '/dashboard' || currentPath === '/' || currentPath === '/vitrine' || currentPath === '/maquette') {
      setActiveTab('dashboard');
    }
  }, [currentPath]);

  useEffect(() => {
    // Check server key status
    fetch('/api/studio/status')
      .then((res) => res.json())
      .then((data) => {
        setHasDedicatedKey(data.hasDedicatedKey || data.hasDefaultKey);
      })
      .catch(() => {});
  }, []);

  const handleAddCredits = async (amount: number, type: 'bonus' | 'achat' = 'bonus', description?: string) => {
    const updated = await storage.addCredits(userId, amount, { type, description });
    setProfile(updated);
    setTransactions(await storage.getTransactions(userId));
  };

  const handleGenerate = async (data: SourceInputData) => {
    if (!profile) return;
    setErrorMessage(null);
    const estimatedPages = data.estimatedPages || 35;

    // Pre-flight Balance Verification (server re-verifies authoritatively too)
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
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch('/api/studio/generate-ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(data),
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

      const sourceDetail = data.sourceType === 'texte_utilisateur'
        ? `Texte brut auteur (${data.rawUserText?.split(/\s+/).filter(Boolean).length || 0} mots)`
        : (data.youtubeUrl || data.fileName || data.promptText?.slice(0, 80) || "Source personnalisée");

      // The server already verified balance, called Gemini, deducted credits
      // (via apply_credit_transaction) and wrote the generation log. The
      // client now just persists the generated ebook itself (RLS permits
      // an authenticated user to insert their own ebooks directly).
      const savedEbook = await storage.saveEbook(
        {
          id: '',
          titre: generatedData.titre || data.userBookTitle || "Manuscrit sans titre",
          sous_titre: generatedData.sous_titre || data.userBookSubtitle || "",
          description: generatedData.description || "",
          statut: 'draft',
          source_type: data.sourceType,
          source_detail: sourceDetail,
          plan: generatedData.plan || [],
          contenu: generatedData.contenu,
          credits_consommes: actualPages,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        userId
      );

      setEbooks(await storage.getEbooks(userId));
      setProfile(await storage.getProfile(userId));
      setTransactions(await storage.getTransactions(userId));
      setLogs(await storage.getGenerationLogs(userId));

      setActiveEbook(savedEbook);
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

  const isTarifsPage = currentPath === '/tarifs' || currentPath === '/prix' || currentPath.startsWith('/tarifs') || currentPath.startsWith('/prix') || activeTab === 'tarifs';

  if (isLoadingData || !profile) {
    return <LoadingScreen />;
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
          setActiveEbook(ebooks[0] || null);
        }}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenDraftsList={() => setIsDraftsOpen(true)}
        hasDedicatedKey={hasDedicatedKey}
        onSignOut={signOut}
      />

      {/* Main Content Area with safe mobile bottom margin */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-8">

        {/* Error notification banner */}
        {(errorMessage || dataError) && (
          <div className="max-w-4xl mx-auto mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">{dataError ? 'Erreur de chargement' : 'Erreur de composition'}</span>
              <p className="text-xs leading-relaxed">{errorMessage || dataError}</p>
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
            profile={profile}
            onNewGeneration={handleResetToNew}
            onNavigateToDashboard={handleNavigateToDashboard}
            onEbookUpdated={async (updated) => {
              setActiveEbook(updated);
              setEbooks(await storage.getEbooks(userId));
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
        onSelectCover={async (coverUrl, title) => {
          if (activeEbook) {
            const updated = { ...activeEbook, cover_theme: title || activeEbook.cover_theme };
            const saved = await storage.saveEbook(updated, userId);
            setActiveEbook(saved);
            setEbooks(await storage.getEbooks(userId));
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

function AuthGate({ currentPath, navigateTo }: { currentPath: string; navigateTo: (path: string) => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <StudioApp userId={user.id} currentPath={currentPath} navigateTo={navigateTo} />;
}

export default function App() {
  // URL routing state lives here, above auth, so the public legal pages
  // stay reachable without a session.
  const [currentPath, setCurrentPath] = useState<string>(() => (
    typeof window !== 'undefined' ? (window.location.pathname || '/') : '/'
  ));

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLegalMentions = currentPath === '/mentions-legales' || currentPath.startsWith('/mentions-legales');
  const isLegalCgu = currentPath === '/cgu' || currentPath.startsWith('/cgu');
  const isLegalRemboursement = currentPath === '/remboursement' || currentPath.startsWith('/remboursement');
  const isLegalConfidentialite = currentPath === '/confidentialite' || currentPath.startsWith('/confidentialite');

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

  return (
    <AuthProvider>
      <AuthGate currentPath={currentPath} navigateTo={navigateTo} />
    </AuthProvider>
  );
}
