import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Info, 
  HelpCircle, 
  X, 
  CornerDownRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Footnote } from '../types';
import { parseParagraphWithFootnotes } from '../lib/footnoteHelper';

interface FootnoteRendererProps {
  paragraph: string;
  footnotes?: Footnote[];
  mode: 'hover' | 'click';
  onAddFootnote?: (targetText: string, noteText: string) => void;
  onEditFootnote?: (footnote: Footnote) => void;
  onDeleteFootnote?: (id: string) => void;
}

export const FootnoteRenderer: React.FC<FootnoteRendererProps> = ({
  paragraph,
  footnotes = [],
  mode = 'click',
  onAddFootnote,
  onEditFootnote,
  onDeleteFootnote
}) => {
  const [activeFootnote, setActiveFootnote] = useState<Footnote | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node)
      ) {
        setActiveFootnote(null);
        setPopoverPos(null);
      }
    };
    if (activeFootnote) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFootnote]);

  const handleTriggerClick = (fn: Footnote, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeFootnote?.reference_number === fn.reference_number) {
      setActiveFootnote(null);
      setPopoverPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveFootnote(fn);
      setPopoverPos({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 6
      });
    }
  };

  const handleMouseEnter = (fn: Footnote, e: React.MouseEvent<HTMLButtonElement>) => {
    if (mode === 'hover') {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveFootnote(fn);
      setPopoverPos({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 6
      });
    }
  };

  const handleMouseLeave = () => {
    if (mode === 'hover') {
      setActiveFootnote(null);
      setPopoverPos(null);
    }
  };

  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  // Check if paragraph contains inline markdown image(s)
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+|\/api\/studio\/[^\s)]+)\)/g;
  const hasImages = imageRegex.test(paragraph);

  if (hasImages) {
    // Reset regex index
    imageRegex.lastIndex = 0;
    const parts: Array<{ type: 'text' | 'image'; content?: string; url?: string; caption?: string }> = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = imageRegex.exec(paragraph)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ type: 'text', content: paragraph.substring(lastIdx, match.index) });
      }
      parts.push({
        type: 'image',
        caption: match[1] || undefined,
        url: match[2],
      });
      lastIdx = imageRegex.lastIndex;
    }
    if (lastIdx < paragraph.length) {
      parts.push({ type: 'text', content: paragraph.substring(lastIdx) });
    }

    return (
      <div className="space-y-3">
        {parts.map((part, pIdx) => {
          if (part.type === 'image' && part.url) {
            return (
              <figure
                key={pIdx}
                className="my-5 rounded-2xl overflow-hidden border border-[#E3DAC8] bg-[#FAF7F0] p-2.5 sm:p-4 shadow-sm text-center transition-all hover:border-[#D5C6AC]"
              >
                <div
                  className="relative group cursor-pointer inline-block max-w-full"
                  onClick={() => setLightboxImage({ url: part.url!, caption: part.caption })}
                >
                  <img
                    src={part.url}
                    alt={part.caption || 'Illustration manuscrit'}
                    className="max-h-[440px] w-auto max-w-full mx-auto rounded-xl object-contain shadow-xs border border-[#EDE4D5]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-sans font-semibold space-x-1.5 backdrop-blur-[1px]">
                    <ExternalLink className="w-4 h-4" />
                    <span>Agrandir</span>
                  </div>
                </div>
                {part.caption && (
                  <figcaption className="mt-2.5 text-xs font-serif-book italic text-[#544A39]">
                    {part.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          if (part.type === 'text' && part.content && part.content.trim()) {
            const subTokens = parseParagraphWithFootnotes(part.content, footnotes);
            return (
              <p key={pIdx} className="indent-6 text-justify relative">
                {subTokens.map((tok, sIdx) => {
                  if (tok.type === 'text') {
                    return <React.Fragment key={sIdx}>{tok.text}</React.Fragment>;
                  }
                  if (tok.type === 'footnote' && tok.footnote) {
                    const fn = tok.footnote;
                    const isSelected = activeFootnote?.reference_number === fn.reference_number;
                    return (
                      <span key={sIdx} className="inline-block relative not-italic">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) triggerRefs.current.set(fn.reference_number, el);
                            else triggerRefs.current.delete(fn.reference_number);
                          }}
                          onClick={(e) => handleTriggerClick(fn, e)}
                          onMouseEnter={(e) => handleMouseEnter(fn, e)}
                          onMouseLeave={handleMouseLeave}
                          className={`inline-flex items-center justify-center -top-2 relative mx-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full transition-all duration-150 shadow-2xs ${
                            isSelected
                              ? 'bg-[#8C2D19] text-[#FAF7F0] ring-2 ring-[#8C2D19]/40 scale-110'
                              : 'bg-[#F2ECE0] text-[#7A2413] hover:bg-[#8C2D19] hover:text-[#FAF7F0] border border-[#D8CEBA]'
                          }`}
                          title={`Note [${fn.reference_number}] : ${fn.terme_cible ? fn.terme_cible + ' — ' : ''}${fn.contenu.slice(0, 40)}...`}
                        >
                          {fn.reference_number}
                        </button>
                      </span>
                    );
                  }
                  return null;
                })}
              </p>
            );
          }
          return null;
        })}

        {/* Lightbox for enlarged image */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-[#FAF7F0] border border-[#E3DAC8] rounded-2xl p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E3DAC8] pb-2">
                <span className="text-xs font-serif-book font-bold text-[#8C2D19]">
                  {lightboxImage.caption || "Illustration du manuscrit"}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-lg hover:bg-[#EDE4D5] text-[#544A39]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-auto max-h-[75vh] flex items-center justify-center">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.caption || "Illustration"}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const tokens = parseParagraphWithFootnotes(paragraph, footnotes);

  return (
    <>
      <p className="indent-6 text-justify relative">
        {tokens.map((tok, idx) => {
          if (tok.type === 'text') {
            return <React.Fragment key={idx}>{tok.text}</React.Fragment>;
          }

          if (tok.type === 'footnote' && tok.footnote) {
            const fn = tok.footnote;
            const isSelected = activeFootnote?.reference_number === fn.reference_number;

            return (
              <span key={idx} className="inline-block relative not-italic">
                <button
                  type="button"
                  ref={(el) => {
                    if (el) triggerRefs.current.set(fn.reference_number, el);
                    else triggerRefs.current.delete(fn.reference_number);
                  }}
                  onClick={(e) => handleTriggerClick(fn, e)}
                  onMouseEnter={(e) => handleMouseEnter(fn, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`inline-flex items-center justify-center -top-2 relative mx-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full transition-all duration-150 shadow-2xs ${
                    isSelected
                      ? 'bg-[#8C2D19] text-[#FAF7F0] ring-2 ring-[#8C2D19]/40 scale-110'
                      : 'bg-[#F2ECE0] text-[#7A2413] hover:bg-[#8C2D19] hover:text-[#FAF7F0] border border-[#D8CEBA]'
                  }`}
                  title={`Note [${fn.reference_number}] : ${fn.terme_cible ? fn.terme_cible + ' — ' : ''}${fn.contenu.slice(0, 40)}...`}
                  aria-label={`Note de bas de page numéro ${fn.reference_number}`}
                >
                  {fn.reference_number}
                </button>
              </span>
            );
          }

          return null;
        })}
      </p>

      {/* Floating Popover on Hover / Click */}
      {activeFootnote && popoverPos && (
        <div
          ref={popoverRef}
          onMouseEnter={() => mode === 'hover' && setActiveFootnote(activeFootnote)}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            left: `${popoverPos.x}px`,
            top: `${popoverPos.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
          className="w-72 sm:w-80 p-3.5 bg-[#FAF7F0] text-[#2E2820] border-2 border-[#8C2D19]/40 rounded-xl shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E3DAC8] pb-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#8C2D19] text-[#FAF7F0] text-[10px] font-mono font-bold flex items-center justify-center">
                {activeFootnote.reference_number}
              </span>
              <span className="text-xs font-serif-book font-bold text-[#8C2D19] uppercase tracking-wider">
                Note de bas de page
              </span>
            </div>
            <button
              onClick={() => {
                setActiveFootnote(null);
                setPopoverPos(null);
              }}
              className="text-[#8C806D] hover:text-[#2E2820] p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Targeted term if present */}
          {activeFootnote.terme_cible && (
            <div className="text-[11px] font-mono text-[#7A2413] bg-[#F4EDE0] px-2 py-0.5 rounded border border-[#E0D4C0] inline-block font-semibold">
              Terme : « {activeFootnote.terme_cible} »
            </div>
          )}

          {/* Footnote text */}
          <p className="text-xs font-serif-book text-[#3A3227] leading-relaxed italic">
            {activeFootnote.contenu}
          </p>

          <div className="pt-1 flex items-center justify-between text-[10px] font-sans text-[#8C806D] border-t border-[#EAE1D1]">
            <span>Mode d'affichage : {mode === 'click' ? 'Au clic' : 'Au survol'}</span>
            <span className="text-[#8C2D19] font-medium">Studio Manuscrit</span>
          </div>
        </div>
      )}
    </>
  );
};

interface FootnoteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  paragraphes: string[];
  initialFootnotes: Footnote[];
  onSaveFootnotes: (updatedFootnotes: Footnote[], updatedParagraphes?: string[]) => void;
}

export const FootnoteManagerModal: React.FC<FootnoteManagerModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  paragraphes,
  initialFootnotes,
  onSaveFootnotes
}) => {
  const [footnotes, setFootnotes] = useState<Footnote[]>(initialFootnotes || []);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTerm, setNewNoteTerm] = useState('');
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number>(0);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTerm, setEditingTerm] = useState('');

  useEffect(() => {
    setFootnotes(initialFootnotes || []);
  }, [initialFootnotes, isOpen]);

  if (!isOpen) return null;

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    const nextRefNumber = footnotes.length > 0
      ? Math.max(...footnotes.map(f => f.reference_number)) + 1
      : 1;

    const newFootnote: Footnote = {
      id: `fn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      reference_number: nextRefNumber,
      contenu: newNoteContent.trim(),
      terme_cible: newNoteTerm.trim() || undefined,
    };

    const updated = [...footnotes, newFootnote];
    setFootnotes(updated);

    // If target term or selected paragraph is defined, inject marker [^N]
    let updatedParas = [...paragraphes];
    const marker = `[^${nextRefNumber}]`;

    if (newNoteTerm.trim() && updatedParas[selectedParagraphIdx]?.includes(newNoteTerm.trim())) {
      // Replace first occurrence of target term with target term + marker
      updatedParas[selectedParagraphIdx] = updatedParas[selectedParagraphIdx].replace(
        newNoteTerm.trim(),
        `${newNoteTerm.trim()}${marker}`
      );
    } else if (updatedParas[selectedParagraphIdx]) {
      // Append marker to paragraph
      updatedParas[selectedParagraphIdx] = `${updatedParas[selectedParagraphIdx]} ${marker}`;
    }

    onSaveFootnotes(updated, updatedParas);
    setNewNoteContent('');
    setNewNoteTerm('');
  };

  const handleDelete = (id: string, refNum: number) => {
    const updated = footnotes.filter(f => f.id !== id);
    setFootnotes(updated);
    
    // Remove marker [^N] from paragraphs
    const markerRegex = new RegExp(`\\[\\^${refNum}\\]`, 'g');
    const updatedParas = paragraphes.map(p => p.replace(markerRegex, ''));
    
    onSaveFootnotes(updated, updatedParas);
  };

  const handleStartEdit = (fn: Footnote) => {
    setActiveEditingId(fn.id);
    setEditingContent(fn.contenu);
    setEditingTerm(fn.terme_cible || '');
  };

  const handleSaveEdit = (id: string) => {
    const updated = footnotes.map(f => {
      if (f.id === id) {
        return {
          ...f,
          contenu: editingContent.trim(),
          terme_cible: editingTerm.trim() || undefined,
        };
      }
      return f;
    });
    setFootnotes(updated);
    setActiveEditingId(null);
    onSaveFootnotes(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F0] border-2 border-[#D8CEBA] rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8DFCC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#8C2D19]">
              <FileText className="w-5 h-5" />
              <h3 className="font-display-title text-lg font-bold">
                Éditeur de Notes de Bas de Page
              </h3>
            </div>
            <p className="text-xs font-serif-book italic text-[#706452]">
              Section : {sectionTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C806D] hover:text-[#2E2820] hover:bg-[#EAE0CD] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Footnotes List */}
        <div className="space-y-3">
          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#5A4E3D] flex items-center justify-between">
            <span>Notes attachées à cette section ({footnotes.length})</span>
            <span className="text-[11px] font-normal text-[#8A7D6C]">Format JSON & Markdown standard</span>
          </h4>

          {footnotes.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/70 border border-dashed border-[#D5C7B0] text-center text-xs text-[#8A7D6C] italic font-serif-book">
              Aucune note de bas de page pour le moment. Insérez une première référence ci-dessous.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {footnotes.map((fn) => (
                <div 
                  key={fn.id}
                  className="bg-white/80 border border-[#E3DAC8] rounded-xl p-3.5 shadow-2xs space-y-2"
                >
                  {activeEditingId === fn.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#8C2D19] text-white text-xs font-mono font-bold">
                          [{fn.reference_number}]
                        </span>
                        <input
                          type="text"
                          value={editingTerm}
                          onChange={(e) => setEditingTerm(e.target.value)}
                          placeholder="Terme cible dans le texte (optionnel)"
                          className="flex-1 text-xs px-2.5 py-1.5 bg-[#FAF7F0] border border-[#D5C7B0] rounded-lg focus:outline-none focus:border-[#8C2D19]"
                        />
                      </div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full text-xs p-2 bg-[#FAF7F0] border border-[#D5C7B0] rounded-lg focus:outline-none focus:border-[#8C2D19] font-serif-book"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveEditingId(null)}
                          className="px-2.5 py-1 text-xs text-[#6B5E4D] hover:bg-[#EAE0CD] rounded-lg"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSaveEdit(fn.id)}
                          className="px-3 py-1 bg-[#8C2D19] text-[#FAF7F0] rounded-lg text-xs font-bold flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Enregistrer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 flex-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#8C2D19] text-[#FAF7F0] text-xs font-mono font-bold mt-0.5 shrink-0">
                          [{fn.reference_number}]
                        </span>
                        <div className="space-y-0.5 text-xs">
                          {fn.terme_cible && (
                            <span className="font-mono text-[10px] text-[#7A2413] bg-[#F2ECE0] px-1.5 py-0.5 rounded border border-[#E0D5C1] inline-block font-semibold">
                              Cible : « {fn.terme_cible} »
                            </span>
                          )}
                          <p className="font-serif-book text-[#3A3125] italic leading-relaxed">
                            {fn.contenu}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(fn)}
                          className="p-1 text-[#8C806D] hover:text-[#8C2D19] hover:bg-[#F2ECE0] rounded-md transition-colors"
                          title="Modifier la note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fn.id, fn.reference_number)}
                          className="p-1 text-[#8C806D] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Footnote Form */}
        <div className="bg-[#FAF4E6] border border-[#D8CCB6] rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#8C2D19] flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une nouvelle note</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-sans font-semibold text-[#5A4E3D] mb-1">
                Insérer dans le paragraphe :
              </label>
              <select
                value={selectedParagraphIdx}
                onChange={(e) => setSelectedParagraphIdx(Number(e.target.value))}
                className="w-full text-xs px-2.5 py-2 bg-white border border-[#D5C7B0] rounded-lg focus:outline-none focus:border-[#8C2D19]"
              >
                {paragraphes.map((p, idx) => (
                  <option key={idx} value={idx}>
                    Paragraphe {idx + 1} ({p.slice(0, 35)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-sans font-semibold text-[#5A4E3D] mb-1">
                Terme cible à annoter (optionnel) :
              </label>
              <input
                type="text"
                value={newNoteTerm}
                onChange={(e) => setNewNoteTerm(e.target.value)}
                placeholder="Ex: modèle génératif, dispositio..."
                className="w-full text-xs px-2.5 py-2 bg-white border border-[#D5C7B0] rounded-lg focus:outline-none focus:border-[#8C2D19]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-semibold text-[#5A4E3D] mb-1">
              Contenu de la note / Explication / Source :
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Rédigez l'annotation, la référence bibliographique ou l'explication contextuelle..."
              rows={2}
              className="w-full text-xs p-2.5 bg-white border border-[#D5C7B0] rounded-lg focus:outline-none focus:border-[#8C2D19] font-serif-book"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="px-4 py-2 bg-[#8C2D19] hover:bg-[#722312] text-[#FAF7F0] rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Insérer la note [^{footnotes.length > 0 ? Math.max(...footnotes.map(f => f.reference_number)) + 1 : 1}]</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-[#8A7D6C] pt-2 border-t border-[#E8DFCC]">
          <span className="italic font-serif-book">
            Les notes sont synchronisées dans le JSON, l'affichage interactif, le PDF et le livre EPUB.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2E2820] hover:bg-[#1A1612] text-[#FAF7F0] rounded-xl text-xs font-bold"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
