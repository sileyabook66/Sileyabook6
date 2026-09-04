import React, { useState } from 'react';
import { 
  Check,
  Tag,
  ShieldCheck,
  Smartphone, 
  CreditCard, 
  Feather, 
  BookOpen, 
  Palette, 
  Layers, 
  FileDown, 
  Share2, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight, 
  Lock, 
  ExternalLink, 
  AlertCircle, 
  HelpCircle,
  X,
  Zap,
  Clock,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

export interface PricingOffer {
  id: 'mise-en-page' | 'mise-en-page-couverture' | 'creation-complete';
  titre: string;
  nomCourt: string;
  badge?: string;
  isPopular?: boolean;
  isPremium?: boolean;
  prixFcfa: number;
  prixFormate: string;
  description: string;
  equivalentPages: number;
  delaiEstime: string;
  inclusions: {
    texte: string;
    detail?: string;
    highlight?: boolean;
  }[];
  exclusions?: string[];
  ctaLabel: string;
}

export const SILEYABOOK_OFFERS: PricingOffer[] = [
  {
    id: 'mise-en-page',
    titre: 'Mise en page',
    nomCourt: 'Mise en page seule',
    prixFcfa: 1000,
    prixFormate: '1 000 FCFA',
    equivalentPages: 30,
    delaiEstime: 'Immédiat (< 30 secondes)',
    description: "Vous avez déjà votre texte ? Collez-le, et repartez avec un PDF mis en page professionnellement — sans couverture.",
    inclusions: [
      { texte: "Collage de votre texte brut (sans mise en forme préalable)" },
      { texte: "Découpage automatique en chapitres et sections harmonieuses par Sileyabook" },
      { texte: "Fidélité 100% garantie au texte original (aucun mot altéré ni tronqué)", highlight: true },
      { texte: "Mise en page typographique soignée (lettrines, marges de vélin, titrailles)" },
      { texte: "Export PDF haute résolution prêt à l'impression et à la lecture" },
      { texte: "Export Markdown structuré et lecture fluide dans le Studio" },
    ],
    exclusions: [
      "Création de couverture graphique (export PDF sans jaquette)"
    ],
    ctaLabel: 'Commander la mise en page — 1 000 FCFA',
  },
  {
    id: 'mise-en-page-couverture',
    titre: 'Mise en page + Couverture',
    nomCourt: 'Mise en page & Couverture',
    badge: 'Formule Équilibrée',
    isPopular: true,
    prixFcfa: 1500,
    prixFormate: '1 500 FCFA',
    equivalentPages: 45,
    delaiEstime: 'Instantané (~1 minute)',
    description: "Le même travail soigné, plus une couverture professionnelle : 5 propositions au choix, prêtes à publier.",
    inclusions: [
      { texte: "Tout ce qui est inclus dans l'offre « Mise en page »" },
      { texte: "Création de la couverture du livre par Sileyabook", highlight: true },
      { texte: "5 propositions visuelles et typographiques personnalisées au choix" },
      { texte: "Export couverture PNG Haute Définition (1200 × 1800 px)" },
      { texte: "Export PDF complet avec couverture intégrée" },
      { texte: "Export EPUB 3.0 fluide compatible liseuses numériques et smartphones" },
    ],
    ctaLabel: 'Choisir Mise en page + Couverture — 1 500 FCFA',
  },
  {
    id: 'creation-complete',
    titre: 'Création complète',
    nomCourt: 'Création Totale',
    badge: 'Le Choix le Plus Complet',
    isPremium: true,
    prixFcfa: 3500,
    prixFormate: '3 500 FCFA',
    equivalentPages: 100,
    delaiEstime: 'Instantané (~2 minutes)',
    description: "Vous n'avez qu'une idée ? Donnez-nous un sujet, une vidéo ou un document — on rédige le livre en entier, couverture comprise.",
    inclusions: [
      { texte: "Génération intégrale du contenu par Sileyabook depuis votre sujet, mot-clé, vidéo ou document", highlight: true },
      { texte: "Plan éditorial structuré, chapitres rédigés, citations et notes de bas de page automatiques" },
      { texte: "Atelier couverture personnalisé avec 5 propositions graphiques au choix" },
      { texte: "Export complet tous formats : PDF A4 / Format Livre, EPUB 3.0, PNG HD, JSON & Markdown" },
      { texte: "Mise en page haute fidélité calibrée pour Amazon KDP (14 formats brochés supportés)" },
      { texte: "Droits commerciaux complets : 100% libre de droit pour revente et publication", highlight: true },
      { texte: "Assistance éditoriale et ré-édition illimitée dans le Studio Sileyabook" },
    ],
    ctaLabel: 'Commander la Création complète — 3 500 FCFA',
  },
];

export interface CountryCode {
  code: string;
  dialCode: string;
  nom: string;
  operateurs: string[];
  placeholder: string;
  longueur: number;
}

export const COUNTRIES: CountryCode[] = [
  {
    code: 'GN',
    dialCode: '+224',
    nom: 'Guinée',
    operateurs: ['Orange Money', 'MTN Mobile Money'],
    placeholder: '620 12 34 56',
    longueur: 9,
  },
  {
    code: 'SN',
    dialCode: '+221',
    nom: 'Sénégal',
    operateurs: ['Wave', 'Orange Money', 'Free Money'],
    placeholder: '77 123 45 67',
    longueur: 9,
  },
  {
    code: 'CI',
    dialCode: '+225',
    nom: "Côte d'Ivoire",
    operateurs: ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'],
    placeholder: '07 12 34 56 78',
    longueur: 10,
  },
  {
    code: 'CM',
    dialCode: '+237',
    nom: 'Cameroun',
    operateurs: ['MTN Mobile Money', 'Orange Money'],
    placeholder: '6 70 12 34 56',
    longueur: 9,
  },
  {
    code: 'BJ',
    dialCode: '+229',
    nom: 'Bénin',
    operateurs: ['MTN Mobile Money', 'Moov Money'],
    placeholder: '97 12 34 56',
    longueur: 8,
  },
  {
    code: 'BF',
    dialCode: '+226',
    nom: 'Burkina Faso',
    operateurs: ['Orange Money', 'Moov Money'],
    placeholder: '70 12 34 56',
    longueur: 8,
  },
  {
    code: 'ML',
    dialCode: '+223',
    nom: 'Mali',
    operateurs: ['Orange Money', 'Moov Money'],
    placeholder: '70 12 34 56',
    longueur: 8,
  },
  {
    code: 'TG',
    dialCode: '+228',
    nom: 'Togo',
    operateurs: ['T-Money', 'Moov Money'],
    placeholder: '90 12 34 56',
    longueur: 8,
  },
  {
    code: 'CG',
    dialCode: '+242',
    nom: 'Congo',
    operateurs: ['Airtel Money', 'MTN Mobile Money'],
    placeholder: '06 123 45 67',
    longueur: 9,
  },
  {
    code: 'CD',
    dialCode: '+243',
    nom: 'RD Congo',
    operateurs: ['M-Pesa', 'Airtel Money', 'Orange Money'],
    placeholder: '81 234 56 78',
    longueur: 9,
  },
  {
    code: 'GA',
    dialCode: '+241',
    nom: 'Gabon',
    operateurs: ['Airtel Money', 'Moov Money'],
    placeholder: '074 12 34 56',
    longueur: 8,
  },
  {
    code: 'NE',
    dialCode: '+227',
    nom: 'Niger',
    operateurs: ['Airtel Money', 'Moov Money'],
    placeholder: '90 12 34 56',
    longueur: 8,
  },
  {
    code: 'FR',
    dialCode: '+33',
    nom: 'France / International',
    operateurs: ['Carte Bancaire', 'Visa / Mastercard'],
    placeholder: '6 12 34 56 78',
    longueur: 9,
  },
];

interface PricingScreenProps {
  profile: UserProfile;
  onNavigate: (route: string) => void;
  onOfferPurchased?: (offer: PricingOffer, transactionId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({
  profile,
  onNavigate,
  onOfferPurchased,
  onClose,
  isModal = false,
}) => {
  // Selected offer for purchase modal / payment drawer
  const [selectedOffer, setSelectedOffer] = useState<PricingOffer | null>(null);

  // Payment form state
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRIES[0]); // Default +224 Guinée
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<string>(COUNTRIES[0].operateurs[0]);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [cguError, setCguError] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    offer: PricingOffer;
    orderId: string;
    date: string;
  } | null>(null);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setSelectedOperator(country.operateurs[0]);
    setIsCountryDropdownOpen(false);
    setPhoneNumber('');
    setPhoneError(null);
  };

  const handleOpenCheckout = (offer: PricingOffer) => {
    setSelectedOffer(offer);
    setPaymentSuccess(null);
    setPhoneNumber('');
    setPhoneError(null);
    setCguError(false);
  };

  const handleValidatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    // Validate CGU
    if (!acceptedCgu) {
      setCguError(true);
      return;
    }
    setCguError(false);

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 6) {
      setPhoneError('Veuillez saisir un numéro de téléphone valide');
      return;
    }
    setPhoneError(null);

    setIsProcessing(true);

    // Simulate Mobile Money Push Notification / USSD processing
    setTimeout(() => {
      setIsProcessing(false);
      const orderId = `CMD-${selectedCountry.code}-${Date.now().toString().slice(-6)}`;
      const nowIso = new Date().toISOString();

      const successData = {
        offer: selectedOffer,
        orderId,
        date: nowIso,
      };

      setPaymentSuccess(successData);

      if (onOfferPurchased) {
        onOfferPurchased(selectedOffer, orderId);
      }
    }, 1800);
  };

  const handleGoToStudio = (offerId: string) => {
    if (onClose) onClose();
    if (offerId === 'mise-en-page' || offerId === 'mise-en-page-couverture') {
      onNavigate('/studio/nouveau?mode=texte');
    } else {
      onNavigate('/studio/nouveau?mode=generation');
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'py-8 sm:py-12 px-4 sm:px-6 lg:px-8'} max-w-5xl mx-auto font-work-sans text-[#22211E]`}>
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3.5">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#2B4DE8]/20 text-xs font-semibold text-[#2B4DE8] shadow-2xs">
          <Tag className="w-3.5 h-3.5 text-[#2B4DE8]" />
          <span>Offres &amp; Formules Éditoriales Sileyabook</span>
        </div>
        
        <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14161F] tracking-tight">
          Tarifs Clairs, Sans Abonnement
        </h1>
        
        <p className="text-sm sm:text-base text-[#4A4E5A] font-poppins leading-relaxed">
          Payez uniquement pour ce que vous créez, aucun abonnement. Trois formules simples, du texte mis en page au livre généré de A à Z.
        </p>

        {/* Security & Instant Delivery Highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#8089A6]">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2B4DE8]" />
            <span>Paiement Mobile Money instantané</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2B4DE8]" />
            <span>Accès immédiat à l'Atelier</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2B4DE8]" />
            <span>Exports PDF &amp; EPUB sans filigrane</span>
          </span>
        </div>
      </div>

      {/* 3 OFFERS STACKED VERTICALLY (MOBILE-FIRST) */}
      <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
        {SILEYABOOK_OFFERS.map((offer) => {
          const isSelected = selectedOffer?.id === offer.id;

          return (
            <div
              key={offer.id}
              onClick={() => setSelectedOffer(offer)}
              className={`relative rounded-3xl transition-all duration-300 cursor-pointer p-6 sm:p-8 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1877F2] text-white border-2 border-[#1877F2] ring-4 ring-[#1877F2]/35 shadow-xl shadow-[#1877F2]/30 scale-[1.01]'
                  : offer.isPremium
                  ? 'bg-gradient-to-b from-[#14161F] to-[#0B0F19] border-2 border-[#2B4DE8] shadow-sonic text-white hover:border-[#1877F2]/80'
                  : offer.isPopular
                  ? 'bg-gradient-to-b from-[#14161F] to-[#0B0F19] border-2 border-[#FF7F00] shadow-sonic-orange text-white hover:border-[#1877F2]/80'
                  : 'bg-white border border-[#E7EAF3] hover:border-[#1877F2]/60 shadow-card-soft text-[#14161F]'
              }`}
            >
              
              {/* Optional Top Badge */}
              {offer.badge && (
                <div className="absolute -top-3.5 right-6 sm:right-8">
                  <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs transition-all duration-300 ${
                    isSelected
                      ? 'bg-white text-[#1877F2] border border-white'
                      : offer.isPremium
                      ? 'bg-[#2B4DE8] text-white border border-[#60A5FA]'
                      : 'bg-gradient-to-r from-[#FF7F00] to-[#F26A00] text-white border border-white/20'
                  }`}>
                    <Award className={`w-3.5 h-3.5 ${isSelected ? 'text-[#1877F2]' : 'text-white'}`} />
                    <span>{offer.badge}</span>
                  </span>
                </div>
              )}

              {/* Card Main Info */}
              <div className="space-y-5">
                
                {/* Header: Title, Description & Price */}
                <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-5 transition-colors duration-300 ${
                  isSelected 
                    ? 'border-white/20' 
                    : offer.isPremium || offer.isPopular 
                    ? 'border-[#1E2438]' 
                    : 'border-[#E7EAF3]'
                }`}>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isSelected 
                          ? 'text-blue-100' 
                          : offer.isPopular 
                          ? 'text-[#FF7F00]' 
                          : 'text-[#2B4DE8]'
                      }`}>
                        {offer.id === 'mise-en-page' ? 'Offre 1' : offer.id === 'mise-en-page-couverture' ? 'Offre 2' : 'Offre 3 (Premium)'}
                      </span>
                      {isSelected && (
                        <span className="bg-white text-[#1877F2] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          Sélectionnée
                        </span>
                      )}
                    </div>
                    <h2 className={`font-poppins text-2xl sm:text-3xl font-extrabold transition-colors duration-300 ${
                      isSelected ? 'text-white' : ''
                    }`}>
                      {offer.titre}
                    </h2>
                    <p className={`text-xs sm:text-sm font-poppins leading-relaxed pt-1 transition-colors duration-300 ${
                      isSelected 
                        ? 'text-blue-100' 
                        : offer.isPremium || offer.isPopular 
                        ? 'text-[#8089A6]' 
                        : 'text-[#4A4E5A]'
                    }`}>
                      {offer.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className={`sm:text-right shrink-0 p-3 sm:p-0 rounded-2xl border sm:border-0 transition-colors duration-300 ${
                    isSelected
                      ? 'bg-white/10 sm:bg-transparent border-white/20'
                      : offer.isPremium || offer.isPopular 
                      ? 'bg-[#0B0F19] sm:bg-transparent border-[#1E2438]' 
                      : 'bg-[#F6F8FF] sm:bg-transparent border-[#E7EAF3]'
                  }`}>
                    <div className={`text-[11px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                      isSelected ? 'text-blue-100' : 'text-[#8089A6]'
                    }`}>
                      Tarif Unique
                    </div>
                    <div className={`font-poppins text-3xl sm:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
                      isSelected ? 'text-white' : ''
                    }`}>
                      {offer.prixFormate}
                    </div>
                    <div className={`text-[11px] font-poppins italic transition-colors duration-300 ${
                      isSelected ? 'text-blue-100' : 'text-[#8089A6]'
                    }`}>
                      Par création d'eBook
                    </div>
                  </div>
                </div>

                {/* Inclusions List */}
                <div className="space-y-3 pt-1">
                  <div className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors duration-300 ${
                    isSelected ? 'text-blue-100' : offer.isPremium || offer.isPopular ? 'text-[#8089A6]' : 'text-[#4A4E5A]'
                  }`}>
                    <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#2B4DE8]'}`} />
                    <span>Ce qui est inclus dans cette formule :</span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {offer.inclusions.map((inc, i) => (
                      <li 
                        key={i} 
                        className={`flex items-start space-x-2.5 text-xs sm:text-sm leading-snug p-2.5 rounded-xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/15 text-white border border-white/25'
                            : inc.highlight 
                            ? offer.isPremium || offer.isPopular
                              ? 'bg-[#0B0F19] text-white font-semibold border border-[#2B4DE8]' 
                              : 'bg-[#EEF2FF] text-[#2B4DE8] font-semibold border border-[#2B4DE8]/30'
                            : offer.isPremium || offer.isPopular
                              ? 'bg-[#14161F]/60 text-[#D1D5DB] border border-[#1E2438]'
                              : 'bg-[#F6F8FF] text-[#4A4E5A] border border-[#E7EAF3]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                          isSelected
                            ? 'bg-white text-[#1877F2]'
                            : offer.isPopular 
                            ? 'bg-[#FF7F00]/20 text-[#FF7F00]' 
                            : 'bg-[#2B4DE8]/20 text-[#2B4DE8]'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className={isSelected ? 'text-white' : ''}>{inc.texte}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Exclusions if any */}
                  {offer.exclusions && offer.exclusions.length > 0 && (
                    <div className={`pt-2 text-xs font-poppins italic flex items-center space-x-1.5 transition-colors duration-300 ${
                      isSelected ? 'text-blue-100' : 'text-[#8089A6]'
                    }`}>
                      <span className={isSelected ? 'text-white' : 'text-[#FF7F00]'}>•</span>
                      <span>Note : {offer.exclusions.join(', ')}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Card Footer: CTA Button */}
              <div className={`mt-6 pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300 ${
                isSelected ? 'border-white/20' : offer.isPremium || offer.isPopular ? 'border-[#1E2438]' : 'border-[#E7EAF3]'
              }`}>
                <div className={`text-xs flex items-center space-x-2 transition-colors duration-300 ${
                  isSelected ? 'text-blue-100' : offer.isPremium || offer.isPopular ? 'text-[#8089A6]' : 'text-[#4A4E5A]'
                }`}>
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#2B4DE8]'}`} />
                  <span>Délai de composition : <strong className={isSelected ? 'text-white' : offer.isPremium || offer.isPopular ? 'text-white' : 'text-[#14161F]'}>{offer.delaiEstime}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCheckout(offer);
                  }}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-poppins font-bold shadow-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSelected
                      ? 'bg-white hover:bg-blue-50 text-[#1877F2] shadow-lg scale-105'
                      : offer.isPopular
                      ? 'bg-gradient-to-r from-[#FF7F00] to-[#F26A00] hover:from-[#F26A00] hover:to-[#E05E00] text-white shadow-sonic-orange hover:scale-105'
                      : offer.isPremium
                      ? 'bg-gradient-to-r from-[#2B4DE8] to-[#1B36C9] hover:from-[#1B36C9] hover:to-[#011CF6] text-white shadow-sonic hover:scale-105'
                      : 'bg-gradient-to-r from-[#2B4DE8] to-[#1B36C9] hover:from-[#1B36C9] hover:to-[#011CF6] text-white shadow-sonic hover:scale-105'
                  }`}
                >
                  <span>{offer.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-12 bg-[#132238] border border-[#2E4374] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-md space-y-4 text-white">
        <div className="flex items-center space-x-3 text-[#60A5FA]">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <h3 className="font-display-title text-base sm:text-lg font-bold text-white">
            Garantie Sérénité &amp; Droits Commerciaux Sileyabook
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#93C5FD] leading-relaxed font-serif-book">
          Tous les livres conçus sur Sileyabook vous appartiennent intégralement. Vous disposez des droits d'exploitation et de revente exclusifs, sans redevance ni commission. Nos modèles respectent les standards éditoriaux internationaux (E-Pub 3.0, PDF A4 &amp; Livre).
        </p>
      </div>

      {/* FAQ SECTION */}
      <div className="mt-12 max-w-3xl mx-auto space-y-4">
        <h3 className="font-display-title text-lg sm:text-xl font-bold text-[#0F172A] text-center mb-6">
          Questions Fréquentes sur les Tarifs
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="bg-[#132238] border border-[#2E4374] hover:border-[#60A5FA] rounded-2xl p-4 sm:p-5 space-y-1.5 transition-colors text-white">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span>Comment fonctionne le paiement par Mobile Money ?</span>
            </h4>
            <p className="text-[#93C5FD] font-serif-book leading-relaxed pl-6">
              Sélectionnez simplement votre pays (+224 Guinée, +221 Sénégal, +225 Côte d'Ivoire, etc.) et entrez votre numéro de téléphone. Vous recevrez une invite de confirmation instantanée sur votre téléphone pour valider la transaction en toute sécurité.
            </p>
          </div>

          <div className="bg-[#132238] border border-[#2E4374] hover:border-[#60A5FA] rounded-2xl p-4 sm:p-5 space-y-1.5 transition-colors text-white">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span>Puis-je rééditer mon eBook après l'achat ?</span>
            </h4>
            <p className="text-[#93C5FD] font-serif-book leading-relaxed pl-6">
              Oui ! Votre manuscrit reste enregistré dans votre espace créateur Sileyabook. Vous pouvez réajuster les chapitres, réexporter le PDF ou modifier les notes à tout moment.
            </p>
          </div>

          <div className="bg-[#132238] border border-[#2E4374] hover:border-[#60A5FA] rounded-2xl p-4 sm:p-5 space-y-1.5 transition-colors text-white">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span>Quelle est la différence entre l'Offre 1 et l'Offre 2 ?</span>
            </h4>
            <p className="text-[#93C5FD] font-serif-book leading-relaxed pl-6">
              L'Offre 1 met en page votre texte sans couverture graphique (idéal pour des documents intérieurs ou mémoires). L'Offre 2 ajoute un atelier couverture complet avec 5 propositions graphiques créées par Sileyabook et l'export EPUB pour liseuses.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / DRAWER DE PAIEMENT MOBILE MONEY */}
      {/* ========================================================================= */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#132238] border border-[#2E4374] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#2E4374] flex items-center justify-between bg-[#0B1524]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] border border-[#2E4374] text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div>
                  <h3 className="font-display-title text-base sm:text-lg font-bold text-white">
                    Paiement Mobile Money
                  </h3>
                  <p className="text-xs text-[#93C5FD] font-serif-book">
                    Sileyabook • {selectedOffer.titre}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-xl text-[#93C5FD] hover:text-white hover:bg-[#1B2A4A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* If payment success */}
              {paymentSuccess ? (
                <div className="space-y-5 py-4 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-display-title text-xl font-bold text-white">
                      Paiement Validé avec Succès !
                    </h4>
                    <p className="text-xs text-[#93C5FD] font-serif-book max-w-sm mx-auto">
                      Votre commande <strong>{paymentSuccess.orderId}</strong> pour la formule <strong>{paymentSuccess.offer.titre}</strong> ({paymentSuccess.offer.prixFormate}) a été activée.
                    </p>
                  </div>

                  <div className="p-4 bg-[#0B1524] border border-[#2E4374] rounded-2xl text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#93C5FD]">Numéro de commande :</span>
                      <span className="font-bold text-white">{paymentSuccess.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#93C5FD]">Montant réglé :</span>
                      <span className="font-bold text-[#60A5FA]">{paymentSuccess.offer.prixFormate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#93C5FD]">Moyen :</span>
                      <span className="text-white">{selectedOperator} ({selectedCountry.dialCode})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#93C5FD]">Statut :</span>
                      <span className="text-emerald-400 font-bold">Actif • Prêt à composer</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGoToStudio(paymentSuccess.offer.id)}
                    className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Feather className="w-4 h-4 text-[#BFDBFE]" />
                    <span>Ouvrir l'Atelier &amp; Créer mon Livre</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleValidatePayment} className="space-y-5">
                  
                  {/* Order Summary Recap */}
                  <div className="p-4 bg-[#0B1524] border border-[#2E4374] rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono font-bold text-[#60A5FA] uppercase tracking-wider block">
                        Formule sélectionnée
                      </span>
                      <span className="font-display-title text-base font-bold text-white block">
                        {selectedOffer.titre}
                      </span>
                    </div>
                    <div className="text-right font-fraunces text-2xl font-bold text-white">
                      {selectedOffer.prixFormate}
                    </div>
                  </div>

                  {/* COUNTRY CODE SELECTOR & PHONE NUMBER INPUT */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#93C5FD]">
                      Numéro de Téléphone Mobile Money <span className="text-red-400">*</span>
                    </label>

                    <div className="relative flex items-center rounded-2xl border border-[#2E4374] bg-[#0B1524] shadow-inner focus-within:ring-2 focus-within:ring-[#60A5FA] focus-within:border-[#60A5FA]">
                      
                      {/* Country Code Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="flex items-center space-x-1.5 px-3.5 py-3 border-r border-[#2E4374] bg-[#1B2A4A] hover:bg-[#25395F] rounded-l-2xl text-xs font-bold text-white transition-colors shrink-0"
                      >
                        <span className="font-mono text-xs font-bold text-[#E5C07B] bg-[#0F1B33] px-1.5 py-0.5 rounded border border-white/10">{selectedCountry.code}</span>
                        <span className="font-mono">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#93C5FD]" />
                      </button>

                      {/* Phone Input */}
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={selectedCountry.placeholder}
                        className="w-full px-3.5 py-3 text-sm font-mono text-white placeholder:text-[#5A6D88] bg-transparent outline-hidden"
                        autoFocus
                        required
                      />

                      {/* Dropdown Menu */}
                      {isCountryDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-72 max-h-60 overflow-y-auto bg-[#132238] border border-[#2E4374] rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#93C5FD]">
                            Sélectionnez votre pays
                          </div>
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleCountrySelect(c)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors ${
                                selectedCountry.code === c.code
                                  ? 'bg-[#2563EB] text-white font-bold'
                                  : 'hover:bg-[#1B2A4A] text-[#93C5FD]'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[10px] font-bold text-[#E5C07B] bg-[#0F1B33] px-1.5 py-0.5 rounded border border-white/10">{c.code}</span>
                                <span>{c.nom}</span>
                              </div>
                              <span className={`font-mono text-[11px] ${selectedCountry.code === c.code ? 'text-white' : 'text-[#93C5FD]'}`}>
                                {c.dialCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {phoneError && (
                      <p className="text-xs text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  {/* OPERATOR BADGES SELECTOR */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#93C5FD]">
                      Opérateur Mobile Money ({selectedCountry.nom})
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedCountry.operateurs.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setSelectedOperator(op)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                            selectedOperator === op
                              ? 'bg-[#2563EB] text-white border-[#3B82F6] shadow-xs'
                              : 'bg-[#0B1524] hover:bg-[#1B2A4A] text-[#93C5FD] border-[#2E4374]'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MANDATORY CGU ACCEPTANCE */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    cguError && !acceptedCgu
                      ? 'bg-red-950/60 border-red-700 ring-2 ring-red-500'
                      : acceptedCgu
                      ? 'bg-[#0B1524] border-[#2E4374]'
                      : 'bg-[#0B1524]/60 border-[#2E4374]'
                  }`}>
                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedCgu}
                        onChange={(e) => {
                          setAcceptedCgu(e.target.checked);
                          if (e.target.checked) setCguError(false);
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-[#2E4374] text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB] cursor-pointer shrink-0"
                      />
                      <div className="text-xs text-[#93C5FD] space-y-0.5 leading-snug">
                        <span className="font-semibold text-white">
                          J'accepte les{' '}
                          <a
                            href="/cgu"
                            onClick={(e) => {
                              e.preventDefault();
                              if (onClose) onClose();
                              onNavigate('/cgu');
                            }}
                            className="text-[#60A5FA] hover:underline font-bold inline-flex items-center"
                          >
                            Conditions Générales (CGU/CGV)
                          </a>
                          <span className="text-red-400 ml-0.5">*</span>
                        </span>
                        <p className="text-[11px] text-[#93C5FD]/80">
                          Paiement unique de {selectedOffer.prixFormate} sans récurrence ni frais cachés.
                        </p>
                      </div>
                    </label>

                    {cguError && !acceptedCgu && (
                      <div className="mt-2 pl-6 text-xs text-red-400 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Veuillez cocher la case pour valider votre commande.</span>
                      </div>
                    )}
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 ${
                      isProcessing
                        ? 'bg-[#1B2A4A] text-[#5A6D88] cursor-wait'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:shadow-lg hover:shadow-[#2563EB]/25 active:scale-[0.99]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Validation du paiement Mobile Money en cours...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#BFDBFE]" />
                        <span>Payer {selectedOffer.prixFormate} ({selectedOperator})</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#93C5FD] font-serif-book italic">
                    Notification USSD envoyée directement sur votre mobile {selectedCountry.dialCode}.
                  </p>

                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
