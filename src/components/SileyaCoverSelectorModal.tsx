import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Ebook } from '../types';

export interface SileyaCoverOption {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  imageUrl: string;
  colSpan?: string;
  rowSpan?: string;
}

export const SILEYA_SAMPLE_COVERS: SileyaCoverOption[] = [
  {
    id: 'sagesse-ancestrale',
    title: 'Sagesse Ancestrale',
    subtitle: 'Enseignements et traditions vivantes',
    theme: 'Warm ivory paper texture, baobab illustration',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFCVJ3vAn9p8Dn7IecDl5C0dDv19K_12iHFbfDwJz5aiW-VorCqL5ShBm0sm1GomA2PjcWg6-8cFojFFJi36bJyjG0y0TxSlqrBXTO9qj_0TGXfoSpnHIxGnir6PKGAO1LYSoaWhrlWOHu5KjnKhr2fkMwd8-a4inv__aNU3eAXIuxoya_ArVIKj5iiNyOybtmY9urSz1OwTawG-cZP7Gc6ePEcZ9hKBZpOO4YfWvS0qsLAHbVAcerTA',
  },
  {
    id: 'eveil-du-lion',
    title: "L'Éveil du Lion",
    subtitle: 'Entrepreneuriat en Afrique : Stratégies pour le Succès',
    theme: 'Deep indigo background with golden vector lion',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNWNMzIZSQSK0YalPHL5TMF-2X3ygAXmEYAs8NymcFpL4qrnzVPXLdebCmVObCvDNt0YeBMnre01QjU-mdrOSDn4Q9O78_CeEp7aRopr6Oje82aDfHHOMJGPQNCQbf7KMEV35LzXjji5UHK4ZWlQmCQL4QnEt3sh5Q66823urcZEpAeUsQ2L0sQreixNa1DyqO4Hoib3I9ItXBEYj3ZEyP8m5WDoZEmA9UE1bs6EJRhKnwqLgILBxWpQ',
    colSpan: 'md:col-span-2',
    rowSpan: 'row-span-2',
  },
  {
    id: 'saveurs-du-sahel',
    title: 'Saveurs du Sahel',
    subtitle: 'L’art culinaire et traditions gourmandes',
    theme: 'Golden typography, rich earth tones',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy4uV81NnXX3H0t3bHRghb-ypgDpEBbGu_5xanNFQ-NNtG-j_Vw93I6TUF9hD6L30Q1hYURITQfaAyONQQZTUOWL3xFnZLuF3jqLbE6IzQLLpCs9L7WRXcmzN7AFqbe5B_MffmwfH16C7VxQMmCkja-_EohjlG2OPJgLmhQugb2Rz1h4DpdkrdFOC6dRob_XO84FWV3PbPqzYb1z5i34Q5ZeDEbUOqsDIwiXRgT9YwP29PEGmfCKpwOw',
  },
  {
    id: 'les-brumes-du-fleuve',
    title: 'Les Brumes du Fleuve',
    subtitle: 'Un voyage initiatique le long des rives oubliées',
    theme: 'Deep teal and gold watercolor illustration',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9MZELQhSvHjao-kPBcNcZRVjUcWHyDluK6WGb3xMP-ZRLJ8MJ-kU8Y8IXjOCA_NxEuPYwBZTd1mRnz3O7PuRQKPVTbU6u63jn5JWbfehmnRPEXLQqjJfhv3cdJluhMDSRN0LYXNStz1A46CbA4FIq3-W2XT_mVYjJ2Gzhp6Zjn3S6zCzMiE-ynIucNgEGrRoWjfd9Npktsf-RmtrIToT4SnDZdArvVLQ5DzvHu46m4iG9xbTrlqlZEw',
  },
  {
    id: 'contes-du-crepuscule',
    title: 'Contes du Crépuscule',
    subtitle: 'Récits et légendes des veillées ancestrales',
    theme: 'Atmospheric twilight, warm editorial lighting',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-IgHm6CsF0mQC9L1wkbeqVI3ayXEZKoSdzYV_t1alK1ONyaATv6cQ0_8Cur9M0XFRrdm22pFAD6KSj3DXCSCjODvG7DYiGe2cnoV1ULxPV7XuUEj3qZPYIqKo7bxe7CYtbaDobVBKq_WHZlLEjhCWg6t_jV0McBBFvkTF3N0EvGgUsXhVKyGFte5UfPRzrZeqLKyWvimepeD3ljimtYqcaJCL3W-p98ab30eycTZ1NAtWERWemqbHbw',
    colSpan: 'col-span-2 md:col-span-1',
  },
];

interface SileyaCoverSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook?: Ebook;
  onSelectCover?: (coverUrl: string, coverTitle?: string) => void;
}

export const SileyaCoverSelectorModal: React.FC<SileyaCoverSelectorModalProps> = ({
  isOpen,
  onClose,
  ebook,
  onSelectCover,
}) => {
  const [selectedCoverId, setSelectedCoverId] = useState<string>('eveil-du-lion');

  if (!isOpen) return null;

  const selectedCover = SILEYA_SAMPLE_COVERS.find((c) => c.id === selectedCoverId) || SILEYA_SAMPLE_COVERS[1];

  const handleValidateChoice = () => {
    if (onSelectCover && selectedCover) {
      onSelectCover(selectedCover.imageUrl, selectedCover.title);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FBF8FC] text-[#1B1B1E] w-full max-w-5xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-staggered-fade-in border border-[#C5C6CF]/40">
        
        {/* TopAppBar */}
        <header className="sticky top-0 bg-[#FBF8FC]/95 backdrop-blur-md w-full z-20 shadow-xs flex justify-between items-center px-4 sm:px-6 h-16 border-b border-[#C5C6CF]/30">
          <button
            onClick={onClose}
            aria-label="Retour"
            className="text-[#041534] hover:opacity-80 p-2 -ml-2 rounded-full transition-opacity active:scale-95 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="font-fraunces text-xl font-bold text-[#041534] tracking-tight">
            SileyaBook
          </h1>
          
          <div className="w-10"></div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
          
          {/* Header Title Section */}
          <div className="text-center mb-8">
            <h2 className="font-fraunces text-2xl sm:text-3xl font-semibold text-[#041534] mb-2">
              Choisissez votre couverture
            </h2>
            <p className="font-work-sans text-sm sm:text-base text-[#595E6D]">
              Sélectionnez le visuel haute définition qui accompagnera votre œuvre.
            </p>
          </div>

          {/* Masonry / Bento-ish Grid for Covers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] sm:auto-rows-[250px] mb-8">
            {SILEYA_SAMPLE_COVERS.map((cover, index) => {
              const isSelected = selectedCoverId === cover.id;
              const staggerClass = `stagger-${index + 1}`;

              return (
                <div
                  key={cover.id}
                  onClick={() => setSelectedCoverId(cover.id)}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer animate-staggered-fade-in ${staggerClass} ${
                    cover.colSpan || 'col-span-1'
                  } ${cover.rowSpan || ''} transition-all duration-300 ${
                    isSelected
                      ? 'border-4 border-[#1877F2] ring-4 ring-[#1877F2]/35 scale-[1.02] shadow-xl shadow-[#1877F2]/30 z-10'
                      : 'border-2 border-transparent hover:border-[#1877F2]/40 hover:scale-[1.01]'
                  }`}
                >
                  <img
                    alt={cover.title}
                    src={cover.imageUrl}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isSelected ? '' : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Highlight overlay */}
                  <div
                    className={`absolute inset-0 bg-[#041534] transition-opacity duration-300 pointer-events-none ${
                      isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'
                    }`}
                  />

                  {/* Title & Tag in hover/selected */}
                  <div className={`absolute inset-x-0 bottom-0 p-3 text-white flex flex-col justify-end transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-t from-[#1877F2]/95 via-[#1877F2]/75 to-transparent' 
                      : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
                  }`}>
                    <span className="font-fraunces text-xs sm:text-sm font-semibold truncate text-white">
                      {cover.title}
                    </span>
                    <span className="text-[10px] text-white/90 font-work-sans truncate">
                      {cover.subtitle}
                    </span>
                  </div>

                  {/* Selected checkmark badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-[#1877F2] text-white border border-white/60 rounded-full p-1.5 shadow-md flex items-center justify-center animate-in zoom-in-50 duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Validation Action Button */}
          <div className="flex flex-col items-center justify-center pb-6">
            <button
              onClick={handleValidateChoice}
              className="bg-[#1877F2] hover:bg-[#1565C0] text-white font-label-caps text-xs sm:text-sm font-bold tracking-widest px-8 py-3.5 rounded-full shadow-lg shadow-[#1877F2]/25 hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center space-x-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>VALIDER CE CHOIX</span>
            </button>
            <p className="text-xs text-[#595E6D] mt-3 font-work-sans">
              Couverture sélectionnée : <strong className="text-[#1877F2] font-semibold">{selectedCover.title}</strong>
            </p>
          </div>

        </main>

        {/* Modal Footer with quick dismiss */}
        <footer className="bg-[#F5F3F6] border-t border-[#C5C6CF]/40 py-3 px-6 flex justify-between items-center text-xs text-[#595E6D]">
          <span>Générateur de couvertures artistiques SileyaBook</span>
          <button
            onClick={onClose}
            className="text-[#041534] hover:underline font-medium"
          >
            Fermer sans modifier
          </button>
        </footer>

      </div>
    </div>
  );
};
