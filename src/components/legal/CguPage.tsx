import React from 'react';
import { LegalPageLayout } from '../LegalPageLayout';
import { 
  FileText, 
  Cpu, 
  Award, 
  CreditCard, 
  Smartphone, 
  AlertTriangle, 
  ShieldAlert,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CguPageProps {
  onNavigate: (route: string) => void;
}

export const CguPage: React.FC<CguPageProps> = ({ onNavigate }) => {
  return (
    <LegalPageLayout
      currentRoute="cgu"
      title="Conditions Générales d'Utilisation et de Vente"
      subtitle="Les présentes Conditions Générales d'Utilisation et de Vente (CGU/CGV) encadrent l'accès, l'utilisation des services de composition et la commercialisation des eBooks créés via la plateforme SileyaBook."
      onNavigate={onNavigate}
    >
      {/* Article 1 — Objet */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 1 — Objet
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          SileyaBook est une plateforme permettant à ses utilisateurs de concevoir et structurer des eBooks à partir d'un sujet ou de texte personnel fourni par l'utilisateur, avec génération de couverture et export au format PDF et EPUB.
        </p>
      </section>

      {/* Article 2 — Technologies de génération et rédaction */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 2 — Technologies de génération et rédaction
          </h2>
        </div>
        
        <p className="text-sm leading-relaxed text-[#3E3529]">
          SileyaBook utilise des technologies de traitement automatisé du langage pour :
        </p>

        <ul className="space-y-2 pl-2">
          <li className="flex items-start space-x-2.5 text-sm text-[#3E3529]">
            <CheckCircle2 className="w-4 h-4 text-[#8C2D19] shrink-0 mt-0.5" />
            <span>Générer et structurer du contenu textuel à partir d'un sujet fourni par l'utilisateur (mode <em>« Rédiger avec Sileyabook »</em>)</span>
          </li>
          <li className="flex items-start space-x-2.5 text-sm text-[#3E3529]">
            <CheckCircle2 className="w-4 h-4 text-[#8C2D19] shrink-0 mt-0.5" />
            <span>Générer des propositions de couverture visuelle originales</span>
          </li>
        </ul>

        <div className="bg-[#FAF4E6] border-l-4 border-[#8C2D19] p-4 rounded-r-xl text-sm text-[#4A3F30]">
          <strong>Précision relative au texte personnel :</strong> Le mode <em>« J'ai déjà mon texte »</em> reproduit fidèlement le texte fourni par l'utilisateur, seule sa mise en page est automatisée.
        </div>
      </section>

      {/* Article 3 — Propriété du contenu généré */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 3 — Propriété du contenu généré
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          L'utilisateur est propriétaire du contenu final de l'eBook qu'il génère ou met en page via SileyaBook, y compris le droit de le commercialiser sous son propre nom, sous réserve du respect des présentes CGU et de la législation en vigueur.
        </p>
      </section>

      {/* Article 4 — Tarification */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 4 — Tarification
          </h2>
        </div>

        <div className="bg-[#FAF5EB] border border-[#E3D8C4] rounded-2xl p-5 space-y-3">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <span className="font-bold text-base text-[#1C1A17]">Offre « 1 eBook avec couverture générée »</span>
            <span className="font-ibm-mono text-lg font-bold text-[#8C2D19]">3500 FCFA</span>
          </div>
          
          <p className="text-xs text-[#6B5F4E]">Cette formule forfaitaire comprend l'ensemble des prestations suivantes :</p>
          
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#4A3F30] pl-1">
            <li className="flex items-start space-x-2">
              <span className="text-[#8C2D19] font-bold">•</span>
              <span>La rédaction du contenu textuel (mode guidé) ou la mise en page du texte fourni (mode personnel)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#8C2D19] font-bold">•</span>
              <span>Une (1) génération de couverture, comprenant 5 propositions au choix</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#8C2D19] font-bold">•</span>
              <span>L'export final au format PDF</span>
            </li>
          </ul>
        </div>

        <p className="text-xs sm:text-sm text-[#5A4F3E] italic">
          Toute génération supplémentaire de couverture au-delà de la proposition initiale peut faire l'objet d'une tarification additionnelle, précisée avant validation de l'achat.
        </p>
      </section>

      {/* Article 5 — Paiement */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 5 — Paiement
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          Le paiement s'effectue via Chariow et/ou les solutions de paiement mobile disponibles (Orange Money, MTN Mobile Money, Wave, selon le pays de l'utilisateur). Le paiement est exigible avant l'accès aux fonctionnalités de génération.
        </p>
      </section>

      {/* Article 6 — Responsabilité de l'utilisateur */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 6 — Responsabilité de l'utilisateur
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          L'utilisateur s'engage à ne pas utiliser SileyaBook pour créer du contenu illicite, diffamatoire, discriminatoire, ou portant atteinte aux droits de propriété intellectuelle de tiers. SECRETS DIVIN se réserve le droit de suspendre l'accès à tout compte utilisé à des fins abusives.
        </p>
      </section>

      {/* Article 7 — Limitation de responsabilité */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            Article 7 — Limitation de responsabilité
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          SECRETS DIVIN ne garantit pas l'exactitude, l'exhaustivité ou la pertinence du contenu généré automatiquement. L'utilisateur reste seul responsable de la vérification et de l'usage qu'il fait du contenu généré, notamment s'il envisage de le publier ou de le commercialiser.
        </p>
      </section>
    </LegalPageLayout>
  );
};
