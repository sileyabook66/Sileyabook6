import React from 'react';
import { LegalPageLayout } from '../LegalPageLayout';
import { Building2, User, Server, Shield, Mail, MessageSquare } from 'lucide-react';

interface MentionsLegalesPageProps {
  onNavigate: (route: string) => void;
}

export const MentionsLegalesPage: React.FC<MentionsLegalesPageProps> = ({ onNavigate }) => {
  return (
    <LegalPageLayout
      currentRoute="mentions-legales"
      title="Mentions Légales"
      subtitle="Conformément aux dispositions légales et réglementaires applicables, les présentes mentions légales définissent l'identité de l'éditeur et de l'hébergeur du site SileyaBook."
      onNavigate={onNavigate}
    >
      {/* Section 1 : Éditeur du site */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-xl font-bold text-[#1C1A17]">
            1. Éditeur du site
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[#3E3529]">
          Le site <strong>SileyaBook</strong> (accessible à l'adresse <code>sileyabook.com</code>) est édité par :
        </p>

        <div className="bg-[#EFF5FC] border border-[#BFDBFE] rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="font-bold text-base text-[#1B2A4A] font-display-title">
            SECRETS DIVIN
          </div>
          <div className="text-sm text-[#1E293B] space-y-1.5 font-work-sans">
            <p>Entreprise individuelle enregistrée en <strong>République de Guinée</strong></p>
            <p className="font-ibm-mono text-xs text-[#5A6D88]">
              <strong>RCCM :</strong> GN.TCC.2026.A.05915
            </p>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs border-t border-[#BFDBFE]">
              <a 
                href="mailto:contact@sileyabook.com" 
                className="inline-flex items-center space-x-1.5 text-[#1B2A4A] hover:underline font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-[#1B2A4A]" />
                <span>Email : contact@sileyabook.com</span>
              </a>
              <span className="hidden sm:inline text-[#93C5FD]">•</span>
              <a 
                href="https://wa.me/224611080516" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-1.5 text-emerald-800 hover:underline font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp : +224 611 08 05 16</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Directeur de la publication */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#BFDBFE]">
          <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#1B2A4A] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-xl font-bold text-[#0F172A]">
            2. Directeur de la publication
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[#1E293B]">
          <strong>Mohamed [nom de famille]</strong>, en qualité de propriétaire et représentant légal de l'entreprise individuelle <strong>SECRETS DIVIN</strong>.
        </p>
      </section>

      {/* Section 3 : Hébergement */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#BFDBFE]">
          <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#1B2A4A] flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-xl font-bold text-[#0F172A]">
            3. Hébergement &amp; Infrastructure
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[#1E293B]">
          Le site internet et l'application web sont hébergés par :
        </p>

        <div className="bg-[#EFF5FC] border border-[#BFDBFE] rounded-2xl p-5 space-y-2 text-sm text-[#1E293B]">
          <p className="font-semibold text-[#0F172A]">Vercel Inc.</p>
          <p className="text-xs text-[#5A6D88]">340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
          <p className="text-xs">
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#1B2A4A] underline">https://vercel.com</a>
          </p>
        </div>

        <p className="text-sm leading-relaxed text-[#2E4374] italic bg-[#EBF4FE] p-4 rounded-xl border border-[#BFDBFE]">
          La base de données relationnelle, le stockage applicatif et la gestion des fichiers utilisateurs sont hébergés et sécurisés par <strong>Supabase Inc.</strong> et <strong>Cloudinary Ltd.</strong>
        </p>
      </section>

      {/* Section 4 : Propriété intellectuelle */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE1D1]">
          <div className="w-8 h-8 rounded-lg bg-[#F4EDE0] text-[#8C2D19] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="font-display-title text-xl font-bold text-[#1C1A17]">
            4. Propriété intellectuelle
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-[#3E3529]">
          L'ensemble des éléments techniques, graphiques et logiciels de SileyaBook (comprenant l'interface utilisateur, la charte graphique, les composants visuels, l'algorithme et moteur de mise en page automatisée) est la propriété exclusive de <strong>SECRETS DIVIN</strong>, sauf mention expresse contraire.
        </p>
        <p className="text-sm leading-relaxed text-[#3E3529]">
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments de la plateforme, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans autorisation écrite préalable de SECRETS DIVIN.
        </p>
      </section>
    </LegalPageLayout>
  );
};
