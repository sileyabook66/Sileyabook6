import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  FileDown, 
  Copy, 
  Trash2, 
  Edit3, 
  Tablet, 
  LayoutGrid, 
  List, 
  X, 
  Crown, 
  Feather, 
  ArrowRight, 
  Tag, 
  Check, 
  CloudUpload,
  BookMarked
} from 'lucide-react';
import { Ebook, UserProfile, GenerationLog, CreditTransaction } from '../types';
import { exportEbookToPdf, exportCoverToPng } from '../lib/pdfExporter';
import { exportEbookToEpub } from '../lib/epubExporter';
import { storage } from '../lib/storage';
import { ExportCenterModal } from './ExportCenterModal';
import { CreditTransactionsModal } from './CreditTransactionsModal';

interface CreatorDashboardProps {
  profile: UserProfile;
  ebooks: Ebook[];
  logs: GenerationLog[];
  transactions?: CreditTransaction[];
  onOpenNewStudio: () => void;
  onOpenEbook: (ebook: Ebook) => void;
  onOpenUpgrade: () => void;
  onOpenLogs: () => void;
  onOpenTransactions?: () => void;
  onEbooksChanged: (updatedList: Ebook[]) => void;
  onAddBonusCredits?: (amount: number) => void;
  onNavigateToTarifs?: () => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  profile,
  ebooks,
  logs,
  transactions = [],
  onOpenNewStudio,
  onOpenEbook,
  onOpenUpgrade,
  onOpenLogs,
  onOpenTransactions,
  onEbooksChanged,
  onAddBonusCredits,
  onNavigateToTarifs,
}) => {
  // Navigation & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [dashboardViewMode, setDashboardViewMode] = useState<'bento' | 'list'>('bento');

  // Modals state
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<Ebook | null>(null);
  const [exportModalEbook, setExportModalEbook] = useState<Ebook | null>(null);

  // Success notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [exportingEbookId, setExportingEbookId] = useState<string | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Metrics calculation
  const totalEbooks = ebooks.length;
  const publishedCount = ebooks.filter((b) => b.statut === 'published').length;
  const draftCount = ebooks.filter((b) => b.statut === 'draft').length;

  const totalPagesGenerated = useMemo(() => {
    return ebooks.reduce((acc, b) => acc + (b.contenu?.metadata?.pages_estimees || b.credits_consommes || 15), 0);
  }, [ebooks]);

  // Filter user eBooks
  const filteredEbooks = useMemo(() => {
    return ebooks.filter((book) => {
      if (statusFilter !== 'all' && book.statut !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = book.titre.toLowerCase().includes(q);
        const subTitleMatch = (book.sous_titre || '').toLowerCase().includes(q);
        const descMatch = (book.description || '').toLowerCase().includes(q);
        const genreMatch = (book.contenu?.metadata?.genre || '').toLowerCase().includes(q);
        return titleMatch || subTitleMatch || descMatch || genreMatch;
      }
      return true;
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [ebooks, statusFilter, searchQuery]);

  // Action handlers
  const handleDuplicate = (e: React.MouseEvent, ebook: Ebook) => {
    e.stopPropagation();
    const dup = storage.duplicateEbook(ebook.id);
    if (dup) {
      const updated = storage.getEbooks();
      onEbooksChanged(updated);
      showNotification(`Manuscrit « ${ebook.titre} » dupliqué en brouillon.`);
    }
  };

  const confirmDelete = () => {
    if (!ebookToDelete) return;
    storage.deleteEbook(ebookToDelete.id);
    const updated = storage.getEbooks();
    onEbooksChanged(updated);
    showNotification(`Manuscrit « ${ebookToDelete.titre} » supprimé.`, 'info');
    setEbookToDelete(null);
  };

  const handleQuickPdfDownload = (e: React.MouseEvent, ebook: Ebook) => {
    e.stopPropagation();
    setExportingEbookId(ebook.id);
    try {
      exportEbookToPdf(ebook, {
        authorName: profile.name || 'Auteur du Manuscrit',
        coverTheme: (ebook.cover_theme as any) || 'velin',
      });
      showNotification(`Téléchargement du PDF « ${ebook.titre} » lancé.`);
    } catch (err) {
      console.error('Erreur export PDF:', err);
    } finally {
      setExportingEbookId(null);
    }
  };

  const handleQuickEpubDownload = async (e: React.MouseEvent, ebook: Ebook) => {
    e.stopPropagation();
    setExportingEbookId(ebook.id);
    try {
      await exportEbookToEpub(ebook, {
        authorName: profile.name || 'Auteur du Manuscrit',
        coverTheme: (ebook.cover_theme as any) || 'velin',
      });
      showNotification(`Livre EPUB « ${ebook.titre} » téléchargé.`);
    } catch (err) {
      console.error('Erreur export EPUB:', err);
    } finally {
      setExportingEbookId(null);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return "À l'instant";
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      return `Il y a ${diffDays} jours`;
    } catch {
      return 'Récemment';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2A4A] text-[#FAF7F0] border border-[#C98A2C]/60 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs animate-slide-up">
          <Check className="w-4 h-4 text-[#C98A2C]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. TABLEAU DE BORD : COCKPIT AUTEUR ÉPURÉ */}
      <section className="w-full bg-[#1B2A4A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#C98A2C]/40 space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Brand & Introduction */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F1B33] border border-[#C98A2C]/50 text-xs text-[#E5C07B] font-semibold">
              <Crown className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span className="font-work-sans">SileyaBook • Maison d'Édition &amp; Studio Auteur</span>
            </div>

            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Votre livre, publié cette semaine — pas dans six mois
            </h1>

            <p className="font-work-sans text-xs sm:text-sm text-[#F2E9D8]/80 leading-relaxed">
              Racontez votre idée, importez une vidéo ou collez votre texte : SileyaBook compose, met en page et calibre votre manuscrit aux normes <strong>Amazon KDP 6 × 9"</strong> et liseuses. Aucune compétence technique requise.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewStudio}
              className="bg-[#C98A2C] hover:bg-[#b07521] text-[#1A1205] font-fraunces font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Feather className="w-4 h-4" />
              <span>{totalEbooks === 0 ? 'Composer mon premier livre' : 'Composer un nouveau livre'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              onClick={onNavigateToTarifs || onOpenUpgrade}
              className="bg-[#0F1B33] hover:bg-[#16274A] text-[#F2E9D8] border border-[#C98A2C]/40 font-work-sans font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xs transition-all flex items-center space-x-2"
            >
              <Tag className="w-4 h-4 text-[#C98A2C]" />
              <span>Voir les tarifs (dès 1 000 FCFA)</span>
            </button>
          </div>

        </div>

        {/* Essential Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          
          {/* Metric 1: Solde */}
          <div className="bg-[#0F1B33]/80 p-3.5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#C98A2C] font-semibold block">
              Solde de Vélin
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-mono text-2xl font-bold text-white">{profile.credits_pages}</span>
              <span className="text-[11px] text-[#F2E9D8]/70">pages</span>
            </div>
            <button 
              onClick={onOpenUpgrade}
              className="text-[10px] text-[#C98A2C] hover:underline font-semibold"
            >
              + Recharger
            </button>
          </div>

          {/* Metric 2: Ouvrages */}
          <div className="bg-[#0F1B33]/80 p-3.5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#93C5FD] font-semibold block">
              Mes Ouvrages
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-mono text-2xl font-bold text-white">{totalEbooks}</span>
              <span className="text-[11px] text-[#F2E9D8]/70">livres</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium block">
              {publishedCount} publiés • {draftCount} brouillons
            </span>
          </div>

          {/* Metric 3: Volume Rédigé */}
          <div className="bg-[#0F1B33]/80 p-3.5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#93C5FD] font-semibold block">
              Pages Composées
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-mono text-2xl font-bold text-white">{totalPagesGenerated}</span>
              <span className="text-[11px] text-[#F2E9D8]/70">pages</span>
            </div>
            <span className="text-[10px] text-[#F2E9D8]/60 block truncate">
              Format Amazon KDP
            </span>
          </div>

          {/* Metric 4: Formule Actuelle */}
          <div className="bg-[#0F1B33]/80 p-3.5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#C98A2C] font-semibold block">
              Formule &amp; Journal
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-mono text-base font-bold text-[#E5C07B] truncate">{profile.plan_tier}</span>
            </div>
            <button 
              onClick={onOpenLogs}
              className="text-[10px] text-[#93C5FD] hover:underline font-semibold block truncate"
            >
              {logs.length} sessions d'écriture →
            </button>
          </div>

        </div>

      </section>

      {/* 2. BIBLIOTHÈQUE DE MANUSCRITS (ESPACE DE GESTION DIRECTE) */}
      <section className="bg-[#132238] border border-[#2E4374] rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
        
        {/* Controls Bar: Filters, Search & View mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2E4374]">
          
          <div className="flex items-center space-x-3">
            <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#C98A2C]" />
              <span>Mes Manuscrits</span>
            </h2>
            <span className="text-xs font-mono bg-[#1E3A8A] text-white px-2.5 py-0.5 rounded-full font-normal">
              {ebooks.length}
            </span>
          </div>

          {/* Search Input & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1 max-w-xl">
            
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-[#0B1524] p-1 rounded-xl border border-[#2E4374]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  statusFilter === 'all'
                    ? 'bg-[#1877F2] text-white font-bold shadow-xs'
                    : 'text-[#93C5FD] hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  statusFilter === 'published'
                    ? 'bg-[#1877F2] text-white font-bold shadow-xs'
                    : 'text-emerald-400 hover:text-white'
                }`}
              >
                Publiés
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  statusFilter === 'draft'
                    ? 'bg-[#1877F2] text-white font-bold shadow-xs'
                    : 'text-amber-400 hover:text-white'
                }`}
              >
                Brouillons
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#93C5FD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un manuscrit..."
                className="w-full pl-9 pr-4 py-2 bg-[#0B1524] border border-[#2E4374] rounded-xl text-xs text-white placeholder-[#93C5FD] font-serif focus:ring-2 focus:ring-[#1877F2] focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93C5FD] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-[#0B1524] p-1 rounded-xl border border-[#2E4374]">
              <button
                type="button"
                onClick={() => setDashboardViewMode('bento')}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  dashboardViewMode === 'bento'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#93C5FD] hover:text-white'
                }`}
                title="Affichage Grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDashboardViewMode('list')}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  dashboardViewMode === 'list'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#93C5FD] hover:text-white'
                }`}
                title="Affichage Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Empty state or eBook List/Bento */}
        {filteredEbooks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0B1524]/60 rounded-2xl border border-dashed border-[#2E4374] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] text-[#C98A2C] border border-[#2E4374] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-fraunces text-base font-bold text-white">
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucun manuscrit ne correspond à vos filtres'
                  : 'Votre premier livre commence ici'}
              </h3>
              <p className="text-xs text-[#93C5FD] font-work-sans max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez de réinitialiser la recherche ou de sélectionner « Tous ».'
                  : 'Collez un texte, une idée ou un lien YouTube — SileyaBook s\'occupe de la composition et de la mise en page KDP.'}
              </p>
            </div>
            <button
              onClick={onOpenNewStudio}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C98A2C] hover:bg-[#b07521] text-[#1A1205] font-fraunces font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#1A1205]" />
              <span>Composer mon premier livre</span>
            </button>
          </div>
        ) : dashboardViewMode === 'bento' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEbooks.map((ebook) => {
              const pagesCount = ebook.contenu?.metadata?.pages_estimees || ebook.credits_consommes || 15;
              const chapCount = ebook.contenu?.chapitres?.length || ebook.plan?.length || 0;
              const isPublished = ebook.statut === 'published';

              return (
                <article
                  key={ebook.id}
                  onClick={() => onOpenEbook(ebook)}
                  className="bg-[#0B1524] border border-[#2E4374] hover:border-[#C98A2C] rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header Minimal */}
                  <div className="p-4 bg-gradient-to-r from-[#1E3A8A]/50 to-[#0B1524] border-b border-[#2E4374] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-[#C98A2C]/20 border border-[#C98A2C]/40 text-[#FFDDB0] flex items-center justify-center">
                        <BookMarked className="w-4 h-4 text-[#C98A2C]" />
                      </div>
                      <span className="text-xs font-mono text-[#BFDBFE]">
                        {ebook.cover_theme || 'Broché 6 × 9'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                      isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#C98A2C]/20 text-[#FFDDB0] border border-[#C98A2C]/40'
                    }`}>
                      {isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-fraunces text-base font-bold text-white group-hover:text-[#FFDDB0] transition-colors line-clamp-1">
                        {ebook.titre}
                      </h3>
                      <p className="font-work-sans text-xs text-[#93C5FD] line-clamp-2 leading-relaxed">
                        {ebook.sous_titre || ebook.description || 'Manuscrit composé sur SileyaBook.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#2E4374] flex items-center justify-between text-xs text-[#93C5FD]">
                      <span className="font-mono text-[11px] text-[#BFDBFE]">
                        {chapCount} chapitres • ~{pagesCount}p
                      </span>
                      <span className="text-[10px] text-[#7888A4]">
                        {formatRelativeTime(ebook.updated_at)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div 
                      className="flex items-center justify-between pt-1 gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenEbook(ebook)}
                        className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#BFDBFE]" />
                        <span>Éditer</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickPdfDownload(e, ebook)}
                        disabled={exportingEbookId === ebook.id}
                        className="p-2 bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white border border-[#2E4374] rounded-xl text-xs transition-colors"
                        title="Télécharger PDF KDP"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickEpubDownload(e, ebook)}
                        disabled={exportingEbookId === ebook.id}
                        className="p-2 bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white border border-[#2E4374] rounded-xl text-xs transition-colors"
                        title="Télécharger EPUB"
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(e, ebook)}
                        className="p-2 bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white border border-[#2E4374] rounded-xl text-xs transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEbookToDelete(ebook);
                        }}
                        className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded-xl text-xs transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </article>
              );
            })}

            {/* Nouveau Manuscrit Card */}
            <article
              onClick={onOpenNewStudio}
              className="bg-[#0B1524]/60 border-2 border-dashed border-[#2E4374] hover:border-[#C98A2C] rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[220px] hover:bg-[#0B1524] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1B2A4A] border border-[#2E4374] flex items-center justify-center mb-3 group-hover:bg-[#C98A2C] group-hover:border-[#C98A2C] transition-colors">
                <PlusCircle className="w-5 h-5 text-[#93C5FD] group-hover:text-[#1A1205] transition-colors" />
              </div>
              <h3 className="font-fraunces text-base font-bold text-white mb-1 group-hover:text-[#FFDDB0] transition-colors">
                Composer un livre
              </h3>
              <p className="font-work-sans text-xs text-[#93C5FD] max-w-xs mb-3">
                Depuis une idée, un lien YouTube ou votre propre texte.
              </p>
              <span className="text-[11px] font-bold text-[#C98A2C] uppercase tracking-wider group-hover:underline">
                Composer →
              </span>
            </article>

          </div>
        ) : (
          <div className="space-y-3">
            {filteredEbooks.map((ebook) => {
              const pagesCount = ebook.contenu?.metadata?.pages_estimees || ebook.credits_consommes || 15;
              const chapCount = ebook.contenu?.chapitres?.length || ebook.plan?.length || 0;
              const isPublished = ebook.statut === 'published';

              return (
                <div
                  key={ebook.id}
                  onClick={() => onOpenEbook(ebook)}
                  className="group bg-[#0E1C30] hover:bg-[#152B4A] border border-[#2E4374] hover:border-[#60A5FA] rounded-2xl p-4 sm:p-5 transition-all shadow-md cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div className="w-10 h-12 rounded-xl bg-gradient-to-b from-[#1E3A8A] to-[#0A111E] border border-[#3B82F6]/40 text-[#93C5FD] shrink-0 flex flex-col items-center justify-center p-1 text-center">
                      <BookMarked className="w-4 h-4 text-[#93C5FD]" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          isPublished
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                        }`}>
                          {ebook.statut}
                        </span>

                        <span className="text-[11px] font-medium text-[#BFDBFE] bg-[#1B2A4A] px-2 py-0.5 rounded border border-[#2E4374]">
                          {ebook.contenu?.metadata?.genre || 'Essai & Guide'}
                        </span>
                      </div>

                      <h3 className="font-fraunces text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors truncate">
                        {ebook.titre}
                      </h3>

                      <div className="flex items-center space-x-3 text-[11px] text-[#93C5FD] pt-1">
                        <span className="font-mono text-white">{chapCount} chapitres</span>
                        <span>•</span>
                        <span className="font-mono text-[#BFDBFE]">~{pagesCount} pages</span>
                        <span>•</span>
                        <span>{formatRelativeTime(ebook.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex items-center space-x-2 self-end lg:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenEbook(ebook)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickPdfDownload(e, ebook)}
                      className="p-2 rounded-xl bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] border border-[#2E4374]"
                      title="Télécharger PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickEpubDownload(e, ebook)}
                      className="p-2 rounded-xl bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] border border-[#2E4374]"
                      title="Télécharger EPUB"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportModalEbook(ebook);
                      }}
                      className="p-2 rounded-xl bg-[#0B1524] hover:bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374]"
                      title="Export complet"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEbookToDelete(ebook);
                      }}
                      className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* MODAL: DELETE CONFIRMATION */}
      {ebookToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-[#F8FBFF] border border-[#BFDBFE] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 text-red-800">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-bold text-[#0F172A]">
                  Supprimer ce manuscrit ?
                </h3>
                <p className="text-xs text-[#5A6D88] font-work-sans">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#BFDBFE] text-xs space-y-1">
              <p className="font-bold text-[#0F172A]">« {ebookToDelete.titre} »</p>
              <p className="text-[#5A6D88] italic text-[11px] truncate">
                {ebookToDelete.description || ebookToDelete.sous_titre || 'Brouillon de manuscrit'}
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEbookToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#EFF5FC] hover:bg-[#DBEAFE] text-[#1B2A4A] border border-[#BFDBFE] text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT CENTER */}
      {exportModalEbook && (
        <ExportCenterModal
          isOpen={true}
          onClose={() => setExportModalEbook(null)}
          ebook={exportModalEbook}
          defaultAuthor={profile.name}
          onEbookUpdated={(updated) => {
            setExportModalEbook(updated);
            const list = storage.getEbooks();
            onEbooksChanged(list);
          }}
        />
      )}

      {/* MODAL: TRANSACTIONS & CRÉDITS */}
      <CreditTransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        profile={profile}
        transactions={transactions}
        onAddBonusCredits={onAddBonusCredits}
      />

    </div>
  );
};
