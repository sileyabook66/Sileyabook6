import React from 'react';
import { LegalPageLayout } from '../LegalPageLayout';
import { 
  Database, 
  Workflow, 
  Share2, 
  UserCheck, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ConfidentialitePageProps {
  onNavigate: (route: string) => void;
}

export const ConfidentialitePage: React.FC<ConfidentialitePageProps> = ({ onNavigate }) => {
  return (
    <LegalPageLayout
      currentRoute="confidentialite"
      title="Politique de Confidentialité"
      subtitle="Engagements de SileyaBook concernant la protection de vos données personnelles, le traitement via nos algorithmes éditoriaux et la conservation de vos créations."
      onNavigate={onNavigate}
    >
      {/* 1. Données collectées */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            1. Données collectées
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          SileyaBook collecte les informations strictement nécessaires à la création de votre compte et à la production de vos manuscrits :
        </p>
        <div className="bg-[#FAF5EB] border border-[#E3D8C4] rounded-2xl p-4 sm:p-5 text-sm text-[#3E3529] space-y-2">
          <p>• <strong>Données de profil :</strong> adresse email, pseudo, pays.</p>
          <p>• <strong>Données créatives :</strong> le contenu des eBooks créés (texte, prompts, plans, annotations, images de couverture générées).</p>
        </div>
      </section>

      {/* 2. Utilisation des données */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Workflow className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            2. Utilisation des données
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          Ces données sont utilisées uniquement pour :
        </p>
        <ul className="space-y-2 pl-2 text-sm text-[#3E3529]">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#8C2D19] shrink-0 mt-0.5" />
            <span>La fourniture du service (génération de contenu, sauvegarde des brouillons, export au format PDF et EPUB des eBooks)</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#8C2D19] shrink-0 mt-0.5" />
            <span>La communication liée à votre compte (confirmation d'achat, décompte des crédits, assistance et support technique)</span>
          </li>
        </ul>
      </section>

      {/* 3. Partage avec des tiers & Traitement éditorial */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            3. Partage avec des tiers & Traitement automatisé
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[#3E3529]">
          Le contenu textuel fourni pour la génération est transmis aux serveurs de traitement sécurisés pour composition. Les prestataires techniques traitent ces données selon leurs protocoles stricts de confidentialité.
        </p>

        <p className="text-sm leading-relaxed text-[#3E3529]">
          Les images de couverture et actifs visuels sont stockés et distribués via <strong>Cloudinary</strong>.
        </p>

        <div className="bg-[#FAF4E6] border border-[#DDD0B8] rounded-xl p-4 text-xs sm:text-sm font-semibold text-[#8C2D19] flex items-center space-x-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Engagement fondamental : Aucune donnée personnelle n'est vendue ni cédée à des tiers à des fins publicitaires.</span>
        </div>
      </section>

      {/* 4. Droits de l'utilisateur */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            4. Droits de l'utilisateur
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          Conformément à la réglementation applicable, l'utilisateur peut à tout moment demander l'accès, la rectification ou la suppression complète de ses données personnelles en écrivant à :
        </p>
        <p className="text-sm font-medium">
          <a href="mailto:contact@sileyabook.com" className="text-[#8C2D19] underline">contact@sileyabook.com</a>
        </p>
      </section>

      {/* 5. Conservation des données */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-lg sm:text-xl font-bold text-[#1C1A17]">
            5. Conservation des données
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          Les eBooks et données de compte sont conservés tant que le compte utilisateur reste actif. En cas de suppression de compte, l'ensemble des données associées est effacé définitivement sous un délai maximum de <strong>30 jours</strong>.
        </p>
      </section>
    </LegalPageLayout>
  );
};
