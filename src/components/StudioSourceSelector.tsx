import React, { useState, useRef, useMemo } from 'react';
import { 
  Youtube, 
  FileText, 
  PenTool, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  SlidersHorizontal,
  Compass,
  ArrowRight,
  BookMarked,
  Layers,
  FileCheck,
  X,
  AlignLeft,
  Wand2,
  ScrollText,
  Check,
  Zap,
  BookOpen,
  FileEdit,
  Plus,
  Minus,
  Hash,
  Gauge,
  Image as ImageIcon
} from 'lucide-react';
import { SourceInputData, SourceType, WritingTone, UserProfile, StudioMode } from '../types';
import { BookTrimSizeId, getTrimSize } from '../lib/bookTrimSizes';
import { RichManuscriptEditor } from './RichManuscriptEditor';
import { calculateDynamicPagination } from '../lib/textStructure';
import { TrimSizeSelector } from './TrimSizeSelector';

interface StudioSourceSelectorProps {
  profile: UserProfile;
  onGenerate: (data: SourceInputData) => void;
  isGenerating: boolean;
  onOpenUpgrade: () => void;
  onAddBonusCredits?: (amount: number, type?: 'bonus' | 'achat', description?: string) => void;
}

const PRESET_YOUTUBE = [
  {
    title: "Conférence Harvard : L'art de la prise de décision en incertitude",
    url: "https://www.youtube.com/watch?v=kXoY8yWb1dM",
  },
  {
    title: "Masterclass : Anatomie d'un bestseller de non-fiction",
    url: "https://www.youtube.com/watch?v=v9p83N_y6Tw",
  },
];

// 1500-word French sample text with 4 distinct subjects for instant testing
export const SAMPLE_RAW_TEXT_1500_WORDS = `L'Illusion de la Certitude et les Angles Morts de la Prévision

Dans un univers saturé de flux continus et d'injonctions à l'immédiateté, la tentation la plus insidieuse pour le décideur réside dans la quête obsessionnelle de certitude absolue. Nous avons érigé des modèles mathématiques sophistiqués, des prévisions trimestrielles rassurantes et des grilles d'analyse linéaires afin de nous convaincre que l'avenir pouvait être dompté comme une équation déterministe. Pourtant, l'histoire économique et stratégique ne cesse de nous rappeler une vérité fondamentale : plus un système gagne en complexité et en interconnexions, plus il devient imprévisible par nature. L'erreur cognitive majeure consiste à confondre l'absence de preuve d'un risque avec la preuve de son absence, un biais récurrent qui conduit invariablement à l'aveuglement stratégique.

Cette illusion de contrôle engendre une vulnérabilité silencieuse. Lorsque les dirigeants s'enferment dans des certitudes préconçues, ils développent des angles morts cognitifs majeurs. Ils ignorent systématiquement les signaux faibles, ces variations infimes mais précurseurs qui annoncent les ruptures de paradigme. Les organisations rigides investissent des fortunes pour optimiser des processus existants, sans s'apercevoir que le terrain même sur lequel elles opèrent est en train de se dérober. Reconnaître les limites inhérentes de nos capacités de prévision ne relève nullement d'une posture de résignation ou de fatalisme, mais constitue au contraire la première étape indispensable vers une lucidité opérationnelle authentique. Accepter l'incertitude fondamentale n'est pas un aveu de faiblesse, c'est le prérequis absolu pour bâtir des structures véritablement résilientes et adaptatives.


La Cartographie des Risques Asymétriques et l'Antifragilité

Pour naviguer avec succès dans le brouillard de l'incertitude, il est impératif de substituer à la logique prédictive une logique d'exposition aux risques et aux opportunités. C'est ici qu'intervient le concept cardinal d'asymétrie. Dans toute décision d'envergure, le stratège avisé ne se demande pas simplement quelle est la probabilité d'un événement, mais quel est son impact maximal en cas de concrétisation. Un risque dont la survenance est hautement improbable mais dont les conséquences seraient mortelles pour l'organisation doit être neutralisé sans délai, quel que soit le coût apparent de cette protection. Inversement, une opportunité comportant un coût d'échec minime mais un potentiel de gain exponentiel mérite d'être tentée sans hésitation.

Cette posture philosophique et pratique fonde ce que les théoriciens modernes qualifient d'antifragilité. Alors que les structures fragiles se brisent sous l'effet du choc et que les structures robustes se contentent de résister passivement sans évoluer, les organismes antifragiles tirent parti du désordre, de la volatilité et des imprévus pour se renforcer et innover. Appliqué à la gestion d'un collectif ou au déploiement d'un projet créatif, ce principe impose de concevoir des architectures décentralisées et modulaires. Si une composante du dispositif s'effondre face à une bourrasque imprévue, le reste du système non seulement survit sans dommage systémique, mais intègre instantanément la leçon pour fortifier l'ensemble du réseau.


La Discipline de l'Action Minimale et de la Soustraction

Face à une crise ou à un dilemme stratégique ardu, le réflexe quasi universel des états-majors consiste à empiler de nouvelles strates de régulation, de réunions de coordination et d'outils de contrôle. Cette tendance inflationniste, connue sous le nom de biais d'addition, alourdit considérablement la friction opérationnelle et paralyse la prise de décision rapide. Pourtant, les plus grands accomplissements stratégiques procèdent d'une démarche rigoureusement inverse : l'art de la soustraction méthodique et de l'action minimale efficace. Il ne s'agit pas de faire davantage avec moins de ressources, mais d'identifier le point d'appui cardinal où un effort modeste produit un effet de levier massif et durable.

La méthode soustractive exige un courage intellectuel singulier. Elle invite à élaguer sans pitié les initiatives périphériques, les protocoles redondants et les projets vaniteux qui consomment l'énergie vitale des équipes sans créer de valeur tangible. En réduisant drastiquement le bruit de fond, on libère une bande passante cognitive inestimable pour se concentrer exclusivement sur les quelques variables qui font basculer le résultat. Cette discipline du dépouillement confère aux décisions une force de frappe et une lisibilité incomparables : chaque membre de l'organisation comprend instantanément la priorité absolue et dispose de la marge de manœuvre nécessaire pour agir avec discernement et vélocité sur le terrain.


Le Protocole de Rétroaction et d'Apprentissage Continu

Une décision stratégique ne se termine jamais au moment où elle est entérinée ; elle commence véritablement à l'instant où ses premiers effets se confrontent à la résistance du monde réel. C'est pourquoi la marque distinctive des organisations d'élite réside dans la qualité irréprochable de leurs boucles de rétroaction. Sans un mécanisme rigoureux d'examen post-action, l'expérience accumulée au fil des mois ne se transforme jamais en compétence consolidée, et les mêmes erreurs sont condamnées à être répétées sous des dehors légèrement différents.

Mettre en place un protocole d'apprentissage continu implique de dissocier scrupuleusement la qualité d'une décision de la pure chance de son résultat à court terme. Une excellente décision prise selon des critères rigoureux peut parfois échouer en raison d'un coup du sort totalement imprévisible, tandis qu'une décision téméraire et irréfléchie peut exceptionnellement réussir par pur hasard. L'analyste rigoureux refuse de juger rétrospectivement sur le seul résultat visible. Il analyse la méthode, confronte les hypothèses initiales aux données observées et met à jour ses modèles mentaux en temps réel. C'est à ce prix, et à ce prix seulement, que la pratique répétée forge une véritable sagesse stratégique, capable de traverser les tempêtes avec calme, élégance et souveraineté.`;

export const StudioSourceSelector: React.FC<StudioSourceSelectorProps> = ({
  profile,
  onGenerate,
  isGenerating,
  onOpenUpgrade,
  onAddBonusCredits,
}) => {
  // Global Studio Mode: 'ai_generation' vs 'layout_raw_text'
  const [studioMode, setStudioMode] = useState<StudioMode>('ai_generation');

  // Mode "Rédiger avec Sileyabook" State
  const [sourceType, setSourceType] = useState<SourceType>('prompt');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    content: string;
    type: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptText, setPromptText] = useState('');
  const [writingTone, setWritingTone] = useState<WritingTone>('didactique');
  const [estimatedPages, setEstimatedPages] = useState<number>(35);
  const [targetAudience, setTargetAudience] = useState('Professionnels, auteurs et passionnés');
  const [language, setLanguage] = useState('Français');
  const [trimSize, setTrimSize] = useState<BookTrimSizeId>('6x9');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode "J'ai déjà mon texte" State
  const [rawUserText, setRawUserText] = useState('');
  const [userBookTitle, setUserBookTitle] = useState('');
  const [userBookSubtitle, setUserBookSubtitle] = useState('');
  const [rawTextSampleInserted, setRawTextSampleInserted] = useState(false);
  const [useCustomRawPages, setUseCustomRawPages] = useState(false);
  const [customRawPages, setCustomRawPages] = useState<number>(35);

  // Live word & page calculation for Raw Text mode (incorporating reserved space for inline images)
  const rawDynamicStats = useMemo(() => {
    return calculateDynamicPagination(rawUserText);
  }, [rawUserText]);

  const rawWordCount = rawDynamicStats.totalWords;
  const rawImageCount = rawDynamicStats.imageCount;
  const rawAutoEstimatedPages = rawDynamicStats.estimatedPages;

  const rawEstimatedPages = useCustomRawPages ? customRawPages : rawAutoEstimatedPages;

  // Credit calculation depending on active mode
  const requiredCredits = studioMode === 'layout_raw_text' 
    ? (rawEstimatedPages || 1) 
    : estimatedPages;
  const hasEnoughCredits = profile.credits_pages >= requiredCredits;

  const handleAddQuickCredits = (amount: number) => {
    if (onAddBonusCredits) {
      onAddBonusCredits(amount, 'bonus', `Recharge rapide Studio (+${amount} pages)`);
    } else {
      onOpenUpgrade();
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    const sizeStr = (file.size / 1024).toFixed(1) + ' Ko';

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (e) => {
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          content: (e.target?.result as string) || '',
          type: file.type || 'text/plain',
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const simulatedText = `[Contenu extrait du document ${file.name}]\nDocument structuré comprenant synthèse méthodologique, études de cas et protocoles opératoires. Volume source analysé avec succès.`;
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          content: simulatedText,
          type: file.type || 'application/pdf',
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInsertSampleText = () => {
    setUserBookTitle("Traité de la Décision en Incertitude");
    setUserBookSubtitle("Principes d'action et modèles mentaux pour naviguer dans la complexité");
    setRawUserText(SAMPLE_RAW_TEXT_1500_WORDS);
    setRawTextSampleInserted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughCredits || isGenerating) return;

    if (studioMode === 'layout_raw_text') {
      if (!rawUserText.trim() || !userBookTitle.trim()) return;

      onGenerate({
        sourceType: 'texte_utilisateur',
        studioMode: 'layout_raw_text',
        rawUserText,
        userBookTitle,
        userBookSubtitle,
        promptText: rawUserText,
        writingTone: 'essai',
        estimatedPages: rawEstimatedPages,
        trimSize,
        language: 'Français',
      });
      return;
    }

    // AI Generation Mode
    if (sourceType === 'youtube' && !youtubeUrl.trim()) return;
    if (sourceType === 'document' && !uploadedFile) return;
    if (sourceType === 'prompt' && !promptText.trim()) return;

    onGenerate({
      sourceType,
      studioMode: 'ai_generation',
      youtubeUrl,
      videoTitle: videoTitle || "Vidéo YouTube analysée",
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      fileContent: uploadedFile?.content,
      fileMimeType: uploadedFile?.type,
      promptText,
      targetAudience,
      writingTone,
      estimatedPages,
      trimSize,
      language,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Status Indicator & Title Header */}
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] border border-[#2B4DE8]/20 text-[#2B4DE8] font-poppins text-xs font-semibold shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-[#2B4DE8]" />
          <span>{profile.credits_pages} pages restantes dans votre solde</span>
        </div>

        <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14161F] tracking-tight">
          Générateur &amp; Studio de Composition IA
        </h1>
        <p className="text-sm sm:text-base text-[#4A4E5A] max-w-2xl mx-auto font-poppins">
          Créez en quelques clics des livres brochés et eBooks prêts à la vente avec notre moteur d'édition haute fidélité.
        </p>
      </div>

      {/* Choice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        
        {/* Card 1: Assist with Sileyabook */}
        <button
          type="button"
          onClick={() => setStudioMode('ai_generation')}
          className={`interactive-card rounded-2xl p-7 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden h-56 transition-all duration-300 ${
            studioMode === 'ai_generation'
              ? 'bg-[#1877F2] text-white border-2 border-[#1877F2] shadow-lg shadow-[#1877F2]/25 scale-[1.01]'
              : 'bg-white text-[#14161F] border border-[#E7EAF3] hover:border-[#1877F2]/40 hover:shadow-card-soft'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 ${
            studioMode === 'ai_generation'
              ? 'bg-white/20 text-white shadow-xs'
              : 'bg-[#EEF2FF] text-[#1877F2]'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="font-poppins text-lg sm:text-xl font-bold">
            Rédiger avec SileyaBook IA
          </h2>
          <p className={`font-poppins text-xs sm:text-sm max-w-xs leading-relaxed transition-colors duration-300 ${
            studioMode === 'ai_generation' ? 'text-blue-100' : 'text-[#8089A6]'
          }`}>
            Composition automatisée d'un manuscrit structuré à partir d'un sujet, plan, document ou vidéo.
          </p>

          {/* Selected marker */}
          {studioMode === 'ai_generation' && (
            <div className="absolute top-3 right-3 bg-white text-[#1877F2] rounded-full p-1 shadow-sm animate-in zoom-in-50 duration-200">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Card 2: Manual Upload & Raw Text */}
        <button
          type="button"
          onClick={() => setStudioMode('layout_raw_text')}
          className={`interactive-card rounded-2xl p-7 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden h-56 transition-all duration-300 ${
            studioMode === 'layout_raw_text'
              ? 'bg-[#1877F2] text-white border-2 border-[#1877F2] shadow-lg shadow-[#1877F2]/25 scale-[1.01]'
              : 'bg-white text-[#14161F] border border-[#E7EAF3] hover:border-[#1877F2]/40 hover:shadow-card-soft'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 ${
            studioMode === 'layout_raw_text'
              ? 'bg-white/20 text-white shadow-xs'
              : 'bg-[#EEF2FF] text-[#1877F2]'
          }`}>
            <Upload className="w-6 h-6" />
          </div>

          <h2 className="font-poppins text-lg sm:text-xl font-bold">
            Mettre en page mon texte
          </h2>
          <p className={`font-poppins text-xs sm:text-sm max-w-xs leading-relaxed transition-colors duration-300 ${
            studioMode === 'layout_raw_text' ? 'text-blue-100' : 'text-[#8089A6]'
          }`}>
            Importez vos propres écrits. Mise en page et formatage 100% fidèle au texte original.
          </p>

          {/* Selected marker */}
          {studioMode === 'layout_raw_text' && (
            <div className="absolute top-3 right-3 bg-white text-[#1877F2] rounded-full p-1 shadow-sm animate-in zoom-in-50 duration-200">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>

      </div>

      {/* MODE 1: J'ai déjà mon texte (Mise en page de texte brut) */}
      {studioMode === 'layout_raw_text' && (
        <form onSubmit={handleSubmit} className="bg-[#132238] border border-[#2E4374] rounded-2xl p-6 sm:p-8 shadow-xl space-y-7 animate-in fade-in duration-200 text-white">
          
          {/* Header Info Banner */}
          <div className="p-4 rounded-xl bg-[#0B1524] border border-[#2E4374] flex items-start space-x-3 text-xs text-[#93C5FD] leading-relaxed">
            <ScrollText className="w-5 h-5 text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase tracking-wider block">
                Fidélité Textuelle 100% Verbatim Garantie
              </span>
              <p>
                Collez votre contenu brut (articles, cours, notes, brouillons). Sileyabook analyse la structure pour identifier les coupures naturelles de chapitres <strong>sans jamais reformuler, modifier ou supprimer le moindre mot</strong>.
              </p>
            </div>
          </div>

          {/* Field 1: Book Title (Manual) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-[#93C5FD] uppercase tracking-wider">
                  Titre de l'eBook <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Traité de la Décision en Incertitude"
                  value={userBookTitle}
                  onChange={(e) => setUserBookTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B1524] border border-[#2E4374] rounded-xl text-sm font-semibold text-white placeholder-[#5A6D88] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#93C5FD] uppercase tracking-wider">
                  Sous-titre (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Principes et modèles mentaux"
                  value={userBookSubtitle}
                  onChange={(e) => setUserBookSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B1524] border border-[#2E4374] rounded-xl text-sm text-white placeholder-[#5A6D88] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Field 2: Rich Manuscript Editor with Inline Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
                <span>Contenu Brut du Livre &amp; Illustrations</span>
                <span className="text-red-400">*</span>
              </label>

              {/* Sample 1500-word button */}
              <button
                type="button"
                onClick={handleInsertSampleText}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white text-xs font-medium border border-[#2E4374] transition-all active:scale-95 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Insérer texte d'exemple (1500 mots, 4 sujets)</span>
              </button>
            </div>

            {/* Rich Editor Component */}
            <RichManuscriptEditor
              value={rawUserText}
              onChange={setRawUserText}
              placeholder="Tapez ou collez ici votre texte brut...&#10;&#10;Utilisez le bouton « Ajouter une image » dans la barre d'outils pour insérer des illustrations directement à l'endroit exact de votre curseur (depuis la galerie de votre téléphone ou votre ordinateur).&#10;&#10;Sileyabook structurera automatiquement vos chapitres et réservera l'espace vertical nécessaire pour chaque image."
            />

            {/* Live Metrics Counter Bar with Optional Custom Pagination */}
            <div className="p-3.5 rounded-xl bg-[#0B1524] border border-[#2E4374] text-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 text-[#93C5FD]">
                    <FileText className="w-4 h-4 text-[#60A5FA]" />
                    <span>Volume textuel :</span>
                    <strong className="font-mono text-white">{rawWordCount.toLocaleString()} mots</strong>
                  </div>
                  {rawImageCount > 0 && (
                    <div className="flex items-center space-x-1.5 text-[#38BDF8]">
                      <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
                      <span>Illustrations :</span>
                      <strong className="font-mono text-white">{rawImageCount} {rawImageCount > 1 ? 'images' : 'image'}</strong>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 text-[#93C5FD]">
                    <Layers className="w-4 h-4 text-[#60A5FA]" />
                    <span>Pagination estimée :</span>
                    <strong className="font-mono text-white">{rawEstimatedPages} pages</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomRawPages(!useCustomRawPages)}
                    className="text-[11px] text-[#60A5FA] hover:text-[#93C5FD] underline font-medium"
                  >
                    {useCustomRawPages ? "Revenir au calcul auto (texte + images)" : "Forcer un nombre de pages personnalisé"}
                  </button>
                </div>
              </div>

              {useCustomRawPages && (
                <div className="pt-2 border-t border-[#2E4374]/60 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#93C5FD]">
                    Définir manuellement la pagination cible :
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomRawPages(Math.max(1, customRawPages - 5))}
                      className="px-2 py-1 bg-[#1B2A4A] rounded text-[11px] font-mono text-white border border-[#2E4374]"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={customRawPages}
                      onChange={(e) => setCustomRawPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 px-2 py-1 bg-[#132238] border border-[#60A5FA] rounded text-center font-mono font-bold text-white text-xs"
                    />
                    <span className="text-[11px] text-[#93C5FD]">pages</span>
                    <button
                      type="button"
                      onClick={() => setCustomRawPages(customRawPages + 5)}
                      className="px-2 py-1 bg-[#1B2A4A] rounded text-[11px] font-mono text-white border border-[#2E4374]"
                    >
                      +5
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Format & Dimensions du livre broché KDP */}
          <div className="space-y-3 pt-2 border-t border-[#2E4374]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
                <BookMarked className="w-4 h-4 text-[#60A5FA]" />
                <span>Format du Livre & Dimensions d'impression (Amazon KDP)</span>
              </label>
              <span className="text-xs text-[#93C5FD]">14 formats supportés</span>
            </div>

            <TrimSizeSelector
              selectedTrimId={trimSize}
              onSelectTrim={setTrimSize}
              pageCount={rawEstimatedPages}
              compact={false}
            />
          </div>

          {/* Credit Check Notification Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            hasEnoughCredits 
              ? 'bg-[#0B1524] border-[#2E4374] text-[#93C5FD]' 
              : 'bg-amber-950/80 border-amber-800 text-amber-200'
          }`}>
            <div className="flex items-start space-x-3">
              {hasEnoughCredits ? (
                <div className="w-8 h-8 rounded-full bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {hasEnoughCredits ? 'Décompte de mise en page' : 'Crédits Pages Insuffisants'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1B2A4A] border border-[#2E4374] text-white">
                    Requis : {requiredCredits} pages | Solde : {profile.credits_pages} pages
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {hasEnoughCredits ? (
                    `Cette mise en page consommera ${requiredCredits} pages de votre solde (1 crédit par page).`
                  ) : (
                    `Votre solde actuel (${profile.credits_pages} pages) est insuffisant pour ce texte (${requiredCredits} pages requises).`
                  )}
                </p>
              </div>
            </div>

            {!hasEnoughCredits && (
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                {onAddBonusCredits && (
                  <button
                    type="button"
                    onClick={() => handleAddQuickCredits(Math.max(100, requiredCredits - profile.credits_pages + 50))}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    +{(Math.max(100, requiredCredits - profile.credits_pages + 50))} pages (Test)
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Recharger des pages
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#93C5FD] flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Accès direct à la lecture de mise en page et à l'export PDF/EPUB.</span>
            </div>

            <button
              type="submit"
              disabled={!hasEnoughCredits || isGenerating || !rawUserText.trim() || !userBookTitle.trim()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-poppins font-bold text-sm flex items-center justify-center space-x-2.5 shadow-sonic transition-all ${
                !hasEnoughCredits || isGenerating || !rawUserText.trim() || !userBookTitle.trim()
                  ? 'bg-[#1E2438] text-[#5A6D88] cursor-not-allowed border border-[#2E4374]'
                  : 'bg-gradient-to-r from-[#2B4DE8] to-[#1B36C9] hover:from-[#1B36C9] hover:to-[#011CF6] text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <AlignLeft className="w-4 h-4 text-white" />
              <span>Mettre en page le texte ({requiredCredits} pages)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </form>
      )}

      {/* MODE 2: Rédiger avec Sileyabook */}
      {studioMode === 'ai_generation' && (
        <form onSubmit={handleSubmit} className="bg-[#132238] border border-[#2E4374] rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 animate-in fade-in duration-200 text-white">
          
          {/* Step 1: Select Source Type */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center font-mono font-bold border border-[#2E4374]">1</span>
                <span>Choisissez la source d'inspiration</span>
              </label>
              <span className="text-xs text-[#93C5FD]">3 modes de composition</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Source 1: YouTube */}
              <button
                type="button"
                onClick={() => setSourceType('youtube')}
                className={`p-4 rounded-xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                  sourceType === 'youtube'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-white/30 shadow-lg shadow-[#1877F2]/30 scale-[1.01]'
                    : 'bg-[#0B0F19] text-[#8089A6] border-[#1E2438] hover:bg-[#14161F] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    sourceType === 'youtube' ? 'bg-white text-[#1877F2] shadow-xs' : 'bg-[#1E2438] text-[#8089A6]'
                  }`}>
                    <Youtube className="w-5 h-5" />
                  </div>
                  {sourceType === 'youtube' && (
                    <div className="bg-white text-[#1877F2] rounded-full p-0.5 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-white">Lien YouTube</h3>
                  <p className={`text-xs mt-0.5 leading-relaxed transition-colors duration-300 ${
                    sourceType === 'youtube' ? 'text-blue-100' : 'text-[#8089A6]'
                  }`}>
                    Conférence, podcast, interview ou masterclass vidéo
                  </p>
                </div>
              </button>

              {/* Source 2: Document */}
              <button
                type="button"
                onClick={() => setSourceType('document')}
                className={`p-4 rounded-xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                  sourceType === 'document'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-white/30 shadow-lg shadow-[#1877F2]/30 scale-[1.01]'
                    : 'bg-[#0B0F19] text-[#8089A6] border-[#1E2438] hover:bg-[#14161F] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    sourceType === 'document' ? 'bg-white text-[#1877F2] shadow-xs' : 'bg-[#1E2438] text-[#8089A6]'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  {sourceType === 'document' && (
                    <div className="bg-white text-[#1877F2] rounded-full p-0.5 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-white">Document</h3>
                  <p className={`text-xs mt-0.5 leading-relaxed transition-colors duration-300 ${
                    sourceType === 'document' ? 'text-blue-100' : 'text-[#8089A6]'
                  }`}>
                    Fichier PDF, DOCX, TXT ou notes de recherche
                  </p>
                </div>
              </button>

              {/* Source 3: Prompt Libre */}
              <button
                type="button"
                onClick={() => setSourceType('prompt')}
                className={`p-4 rounded-xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                  sourceType === 'prompt'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-white/30 shadow-lg shadow-[#1877F2]/30 scale-[1.01]'
                    : 'bg-[#0B0F19] text-[#8089A6] border-[#1E2438] hover:bg-[#14161F] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    sourceType === 'prompt' ? 'bg-white text-[#1877F2] shadow-xs' : 'bg-[#1E2438] text-[#8089A6]'
                  }`}>
                    <PenTool className="w-5 h-5" />
                  </div>
                  {sourceType === 'prompt' && (
                    <div className="bg-white text-[#1877F2] rounded-full p-0.5 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-white">Prompt Libre</h3>
                  <p className={`text-xs mt-0.5 leading-relaxed transition-colors duration-300 ${
                    sourceType === 'prompt' ? 'text-blue-100' : 'text-[#8089A6]'
                  }`}>
                    Description sur mesure de l'idée et du sujet du livre
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Dynamic Source Inputs */}
          <div className="space-y-4 pt-2 border-t border-[#2E4374]">
            <label className="text-sm font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center font-mono font-bold border border-[#2E4374]">2</span>
              <span>Renseignez les éléments de la source</span>
            </label>

            {/* YouTube Input View */}
            {sourceType === 'youtube' && (
              <div className="space-y-4 bg-[#0B1524] p-5 rounded-xl border border-[#2E4374]">
                <div>
                  <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                    URL de la vidéo YouTube <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#132238] border border-[#2E4374] rounded-lg text-sm text-white placeholder-[#5A6D88] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all"
                    />
                    <Youtube className="w-4 h-4 text-[#EF4444] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                    Titre ou thème de la vidéo (optionnel pour affiner le manuscrit)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Synthèse des neurosciences appliquées à la concentration"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#132238] border border-[#2E4374] rounded-lg text-sm text-white placeholder-[#5A6D88] focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                  />
                </div>

                {/* YouTube Examples */}
                <div className="pt-2">
                  <span className="text-[11px] text-[#93C5FD] block mb-2 font-medium">Idées de vidéos à tester :</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_YOUTUBE.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setYoutubeUrl(item.url);
                          setVideoTitle(item.title);
                        }}
                        className="text-xs px-2.5 py-1 rounded bg-[#1B2A4A] text-[#93C5FD] hover:bg-[#25395F] hover:text-white border border-[#2E4374] transition-colors text-left font-medium"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Document Upload View */}
            {sourceType === 'document' && (
              <div className="space-y-4 bg-[#0B1524] p-5 rounded-xl border border-[#2E4374]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#60A5FA] bg-[#1B2A4A]'
                        : 'border-[#2E4374] hover:border-[#60A5FA] bg-[#132238]'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Cliquez pour importer ou glissez votre document
                    </p>
                    <p className="text-xs text-[#93C5FD] mt-1">
                      Formats acceptés : PDF, Word (DOCX), Fichiers texte (.TXT, .MD)
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#132238] p-4 rounded-xl border border-[#2E4374] flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">{uploadedFile.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-[#1B2A4A] text-[#93C5FD] rounded border border-[#2E4374]">
                            {uploadedFile.size}
                          </span>
                        </div>
                        <p className="text-xs text-[#93C5FD] mt-1 line-clamp-2 italic">
                          "{uploadedFile.content.slice(0, 140)}..."
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-[#93C5FD] hover:text-white p-1"
                      title="Supprimer ce fichier"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Libre View */}
            {sourceType === 'prompt' && (
              <div className="space-y-4 bg-[#0B1524] p-5 rounded-xl border border-[#2E4374]">
                <div>
                  <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                    Description et intentions de votre livre <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez en détail le sujet, les thématiques maîtresses, les objectifs pour le lecteur, les études de cas souhaitées..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    required
                    className="w-full p-3.5 bg-[#132238] border border-[#2E4374] rounded-lg text-sm text-white placeholder-[#5A6D88] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Editorial Options & Free User-Defined Page Volume */}
          <div className="space-y-5 pt-2 border-t border-[#2E4374]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center font-mono font-bold border border-[#2E4374]">3</span>
                <span>Tonalité, style & volume de pages au choix</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-[#93C5FD] hover:text-white flex items-center space-x-1 font-medium transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Masquer options' : 'Options avancées'}</span>
              </button>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                Tonalité et Style d'écriture
              </label>
              <select
                value={writingTone}
                onChange={(e) => setWritingTone(e.target.value as WritingTone)}
                className="w-full px-3 py-2.5 bg-[#0B1524] border border-[#2E4374] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
              >
                <option value="didactique">Didactique & Pédagogique (Explicatif, clair, structuré)</option>
                <option value="narratif">Narratif & Littéraire (Immersif, fluide, vivant)</option>
                <option value="essai">Essai Réfléchi (Analytique, visionnaire, soigné)</option>
                <option value="guide_pratique">Guide Pratique & Actionnable (Méthodique, fiches clés)</option>
                <option value="academique">Académique & Conceptuel (Rigueur, théorique)</option>
                <option value="inspirationnel">Inspirationnel & Éloquent (Dynamique, mobilisateur)</option>
              </select>
            </div>

            {/* Full Custom Page Selector: Chosen Freely by User */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1524] border border-[#2E4374] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[#60A5FA]" />
                    <label className="text-sm font-bold text-white">
                      Volume du livre (Calibré pour la vente sur site &amp; Facebook)
                    </label>
                  </div>
                  <p className="text-xs text-[#93C5FD] mt-0.5 font-serif-book">
                    Format recommandé par défaut : <strong>35 pages</strong> (le ratio optimal pour la vente directe, les infoproduits et les tunnels publicitaires).
                  </p>
                </div>

                {/* Direct Number Input with +/- Steppers */}
                <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    title="Diminuer de 10 pages"
                    onClick={() => setEstimatedPages(Math.max(1, estimatedPages - 10))}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white text-xs font-mono font-bold border border-[#2E4374] transition-colors"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    title="Diminuer de 1 page"
                    onClick={() => setEstimatedPages(Math.max(1, estimatedPages - 1))}
                    className="p-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white border border-[#2E4374] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={estimatedPages}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          setEstimatedPages(val);
                        } else if (e.target.value === '') {
                          setEstimatedPages(1);
                        }
                      }}
                      className="w-24 px-2.5 py-1.5 bg-[#132238] border-2 border-[#60A5FA] rounded-xl text-center font-mono font-bold text-white text-base focus:outline-none focus:ring-2 focus:ring-[#93C5FD] shadow-inner"
                    />
                    <span className="ml-1.5 text-xs font-semibold text-[#93C5FD]">pages</span>
                  </div>

                  <button
                    type="button"
                    title="Ajouter 1 page"
                    onClick={() => setEstimatedPages(estimatedPages + 1)}
                    className="p-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white border border-[#2E4374] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Ajouter 10 pages"
                    onClick={() => setEstimatedPages(estimatedPages + 10)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#25395F] text-[#93C5FD] hover:text-white text-xs font-mono font-bold border border-[#2E4374] transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Synchronized Continuous Slider */}
              <div className="pt-1">
                <input
                  type="range"
                  min={5}
                  max={Math.max(300, estimatedPages)}
                  step={1}
                  value={estimatedPages}
                  onChange={(e) => setEstimatedPages(Number(e.target.value))}
                  className="w-full accent-[#60A5FA] cursor-pointer h-2 bg-[#1B2A4A] rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-[#93C5FD] mt-1.5 font-mono">
                  <span>5 pages (Traité court)</span>
                  <span>50 pages (Essai standard)</span>
                  <span>100 pages (Livre complet)</span>
                  <span>{Math.max(300, estimatedPages)} pages+ (Grand traité)</span>
                </div>
              </div>

              {/* Dynamic Live Estimation Metrics Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#2E4374] flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <div>
                    <span className="text-[#93C5FD] text-[11px] block">Volume textuel visé</span>
                    <strong className="font-mono text-white text-xs">~{(estimatedPages * 350).toLocaleString()} mots</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#2E4374] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <div>
                    <span className="text-[#93C5FD] text-[11px] block">Découpage conseillé</span>
                    <strong className="font-mono text-white text-xs">
                      ~{Math.min(24, Math.max(2, Math.round((estimatedPages * 350) / 2500)))} chapitres (~2500 mots/chap.)
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#132238] border border-[#2E4374] flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <div>
                    <span className="text-[#93C5FD] text-[11px] block">Temps de lecture moyen</span>
                    <strong className="font-mono text-white text-xs">~{Math.round(estimatedPages * 1.5)} min</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Advanced fields (Audience & Langue) */}
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2E4374]">
                <div>
                  <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                    Public cible
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex : Décideurs, créateurs, étudiants, néophytes curieux"
                    className="w-full px-3 py-2 bg-[#0B1524] border border-[#2E4374] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#93C5FD] mb-1.5">
                    Langue de rédaction
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1524] border border-[#2E4374] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                  >
                    <option value="Français">Français (Édition littéraire)</option>
                    <option value="English">English (UK/US)</option>
                    <option value="Español">Español</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Italiano">Italiano</option>
                  </select>
                </div>
              </div>
            )}

            {/* Format & Dimensions du livre broché KDP */}
            <div className="space-y-3 pt-2 border-t border-[#2E4374]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold uppercase tracking-wider text-[#93C5FD] flex items-center space-x-2">
                  <BookMarked className="w-4 h-4 text-[#60A5FA]" />
                  <span>Format du Livre & Dimensions d'impression (Amazon KDP)</span>
                </label>
                <span className="text-xs text-[#93C5FD]">14 formats supportés</span>
              </div>

              <TrimSizeSelector
                selectedTrimId={trimSize}
                onSelectTrim={setTrimSize}
                pageCount={estimatedPages}
                compact={false}
              />
            </div>

            {/* Quota deduction summary box */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              hasEnoughCredits 
                ? 'bg-[#0B1524] border-[#2E4374] text-[#93C5FD]' 
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}>
              <div className="flex items-start space-x-3">
                {hasEnoughCredits ? (
                  <div className="w-8 h-8 rounded-full bg-[#1B2A4A] text-[#60A5FA] border border-[#2E4374] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {hasEnoughCredits ? 'Décompte du Quota' : 'Crédits Pages Insuffisants'}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1B2A4A] border border-[#2E4374] text-white">
                      Requis : {requiredCredits} pages | Solde actuel : {profile.credits_pages} pages
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {hasEnoughCredits ? (
                      `Cette génération déduira ${requiredCredits} pages de votre solde. Votre nouveau solde sera de ${profile.credits_pages - requiredCredits} pages.`
                    ) : (
                      `Votre solde actuel (${profile.credits_pages} pages) est inférieur au volume choisi (${requiredCredits} pages). Rechargez votre solde pour lancer ce livre.`
                    )}
                  </p>
                </div>
              </div>

              {!hasEnoughCredits && (
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {onAddBonusCredits && (
                    <button
                      type="button"
                      onClick={() => handleAddQuickCredits(Math.max(100, requiredCredits - profile.credits_pages + 50))}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      +{(Math.max(100, requiredCredits - profile.credits_pages + 50))} pages (Test)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF7F00] to-[#F26A00] hover:from-[#F26A00] hover:to-[#E05E00] text-white rounded-lg text-xs font-semibold shadow-sonic-orange transition-all"
                  >
                    Recharger des pages
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8089A6] flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#2B4DE8]" />
              <span>Sauvegarde automatique immédiate en tant que <strong>ebooks.statut = 'draft'</strong></span>
            </div>

            <button
              type="submit"
              disabled={!hasEnoughCredits || isGenerating}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-poppins font-bold text-sm flex items-center justify-center space-x-2.5 shadow-sonic transition-all ${
                !hasEnoughCredits || isGenerating
                  ? 'bg-[#1E2438] text-[#5A6D88] cursor-not-allowed border border-[#2E4374]'
                  : 'bg-gradient-to-r from-[#2B4DE8] to-[#1B36C9] hover:from-[#1B36C9] hover:to-[#011CF6] text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Générer le Manuscrit ({requiredCredits} pages)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
