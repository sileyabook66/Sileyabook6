import React from 'react';
import { LegalPageLayout } from '../LegalPageLayout';
import { 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Mail, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface RemboursementPageProps {
  onNavigate: (route: string) => void;
}

export const RemboursementPage: React.FC<RemboursementPageProps> = ({ onNavigate }) => {
  return (
    <LegalPageLayout
      currentRoute="remboursement"
      title="Politique de Remboursement"
      subtitle="Transparence et conditions applicables aux prestations numériques et services de génération de manuscrits SileyaBook."
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        
        {/* Intro */}
        <p className="text-sm sm:text-base leading-relaxed text-[#3E3529]">
          Compte tenu de la nature numérique du service (génération immédiate de contenu consommant des ressources de calcul), les demandes de remboursement sont traitées au cas par cas dans les conditions suivantes :
        </p>

        {/* 3 Conditions Cards */}
        <div className="space-y-4">
          
          {/* Cas 1 : Échec technique */}
          <div className="bg-[#FAF5EB] border border-emerald-300 rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-base text-[#1C1A17] font-display-title">
                Échec technique avéré
              </h3>
            </div>
            <p className="text-sm text-[#3E3529] leading-relaxed pl-7">
              (Génération non aboutie, fichier corrompu, PDF non exportable) : <strong>remboursement intégral sur simple demande</strong> via WhatsApp ou email, sous 7 jours suivant l'achat.
            </p>
          </div>

          {/* Cas 2 : Insatisfaction sur le contenu généré */}
          <div className="bg-[#FAF5EB] border border-amber-300 rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-bold text-base text-[#1C1A17] font-display-title">
                Insatisfaction sur le contenu généré
              </h3>
            </div>
            <p className="text-sm text-[#3E3529] leading-relaxed pl-7">
              (Qualité perçue, style) : SileyaBook ne garantissant pas un résultat éditorial parfait dès la première génération, ce motif ne donne pas droit à remboursement automatique, mais peut faire l'objet d'un <strong>geste commercial étudié individuellement</strong> (re-génération assistée ou crédit offert).
            </p>
          </div>

          {/* Cas 3 : Changement d'avis */}
          <div className="bg-[#FAF5EB] border border-stone-300 rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2 text-stone-800">
              <XCircle className="w-5 h-5 text-stone-500 shrink-0" />
              <h3 className="font-bold text-base text-[#1C1A17] font-display-title">
                Changement d'avis après génération complète
              </h3>
            </div>
            <p className="text-sm text-[#3E3529] leading-relaxed pl-7">
              Après génération complète et livraison du fichier : <strong>non remboursable</strong>, le service ayant été rendu et les ressources informatiques consommées.
            </p>
          </div>

        </div>

        {/* Modalités de contact pour réclamation */}
        <div className="mt-8 bg-[#FAF4E6] border border-[#DDD0B8] rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-[#8C2D19] font-bold text-sm uppercase tracking-wider font-ibm-mono">
            <HelpCircle className="w-4 h-4" />
            <span>Comment formuler une demande ?</span>
          </div>
          
          <p className="text-sm text-[#3E3529]">
            Toute demande est à adresser directement avec la référence de votre transaction à :
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-sm font-medium">
            <a 
              href="mailto:contact@sileyabook.com" 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-[#D8CCB6] text-[#8C2D19] hover:bg-[#F5ECE0] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>contact@sileyabook.com</span>
            </a>
            
            <a 
              href="https://wa.me/224611080516" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-[#D8CCB6] text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp : +224 611 08 05 16</span>
            </a>
          </div>
        </div>

      </div>
    </LegalPageLayout>
  );
};
