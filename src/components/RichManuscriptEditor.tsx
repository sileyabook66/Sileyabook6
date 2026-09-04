import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Edit3,
  Loader2,
  Layers,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  X,
  Camera,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  parseContentBlocks,
  calculateDynamicPagination,
  uploadImageToServer,
  compressImageClient,
  ContentBlock,
  ImageBlock
} from '../lib/textStructure';

interface RichManuscriptEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichManuscriptEditor: React.FC<RichManuscriptEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Hidden file input for phone gallery and camera
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorPosRef = useRef<number>(value.length);

  // Parse blocks
  const { totalWords, imageCount, estimatedPages, blocks } = calculateDynamicPagination(value);

  // Keep track of cursor position in textarea
  const updateCursorPosition = () => {
    if (textareaRef.current) {
      lastCursorPosRef.current = textareaRef.current.selectionStart;
    }
  };

  const handleTriggerImageUpload = () => {
    updateCursorPosition();
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const filesArray: File[] = Array.from(files);
    let currentText = value;
    let insertIndex = lastCursorPosRef.current ?? currentText.length;
    if (insertIndex > currentText.length) insertIndex = currentText.length;

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadProgress(`Optimisation & Téléversement image ${i + 1}/${filesArray.length}...`);

        // Upload and compress image
        const uploadResult = await uploadImageToServer(
          file,
          file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        );

        const caption = uploadResult.caption || 'Illustration';
        const imageMarkdown = `\n\n![${caption}](${uploadResult.secure_url})\n\n`;

        // Insert at cursor position
        const before = currentText.slice(0, insertIndex);
        const after = currentText.slice(insertIndex);
        currentText = `${before}${imageMarkdown}${after}`;
        insertIndex += imageMarkdown.length;
      }

      onChange(currentText);
      lastCursorPosRef.current = insertIndex;
      setUploadProgress('');
    } catch (err: any) {
      console.error("Erreur lors de l'insertion de l'image:", err);
      setUploadError(err.message || "Erreur lors du téléversement de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to delete an image block
  const handleDeleteImage = (url: string) => {
    const regex = new RegExp(`!\\\\\\[([^\\\\]]*)\\\\\\]\\\\(${escapeRegex(url)}\\\\)`, 'g');
    const updated = value.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(url)}\\)`, 'g'), '').trim();
    onChange(updated);
  };

  // Helper to update an image caption
  const handleUpdateCaption = (url: string, newCaption: string) => {
    const escapedUrl = escapeRegex(url);
    const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedUrl}\\)`, 'g');
    const updated = value.replace(regex, `![${newCaption}](${url})`);
    onChange(updated);
  };

  // Helper for regex escape
  function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return (
    <div className={`space-y-3 rounded-2xl bg-[#09111D] border border-[#2E4374] p-3 sm:p-4 shadow-inner ${className}`}>
      
      {/* Hidden File Input for Phone Gallery / Desktop Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Editor Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#1E3050]">
        
        {/* Left Actions: Add Image & Insert Tools */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleTriggerImageUpload}
            disabled={isUploading}
            aria-label="Ajouter une ou plusieurs images depuis la galerie"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50 focus:ring-2 focus:ring-[#93C5FD] focus:outline-none"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{uploadProgress || 'Téléversement...'}</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-white" />
                <span className="font-bold">Ajouter une image</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-blue-700/60 text-[10px] uppercase font-mono">
                  Galerie / Photo
                </span>
              </>
            )}
          </button>

          {/* Mode switch between Visual Card and Raw Text */}
          <div className="flex items-center p-0.5 bg-[#0B1524] rounded-lg border border-[#203456]">
            <button
              type="button"
              onClick={() => setActiveView('visual')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeView === 'visual'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-[#8DA2C0] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aperçu en direct</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('code')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeView === 'code'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-[#8DA2C0] hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Texte brut</span>
            </button>
          </div>
        </div>

        {/* Right Info: Live Metrics */}
        <div className="flex items-center space-x-3 text-xs text-[#93C5FD]">
          <div className="flex items-center space-x-1 bg-[#0F1D33] px-2.5 py-1 rounded-lg border border-[#203456]">
            <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>{totalWords.toLocaleString()} mots</span>
          </div>

          <div className="flex items-center space-x-1 bg-[#0F1D33] px-2.5 py-1 rounded-lg border border-[#203456]">
            <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{imageCount} {imageCount > 1 ? 'images' : 'image'} (illimité)</span>
          </div>

          <div className="flex items-center space-x-1 bg-[#0F1D33] px-2.5 py-1 rounded-lg border border-[#203456]">
            <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="font-bold text-white">~{estimatedPages} pages</span>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: Visual Mode with inline interactive image cards */}
      {activeView === 'visual' ? (
        <div className="space-y-4">
          <div className="text-[11px] text-[#7E95B8] flex items-center justify-between">
            <span>
              Vous pouvez taper votre texte ci-dessous et insérer des images n'importe où. Les images s'afficheront exactement à l'endroit choisi.
            </span>
            <span className="text-[#60A5FA] font-medium">Curseur actif</span>
          </div>

          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            rows={12}
            required
            placeholder={
              placeholder ||
              "Tapez ou collez ici votre texte...\n\nCliquez sur « Ajouter une image » dans la barre d'outils pour insérer une illustration exactement à la position de votre curseur (depuis la galerie de votre téléphone ou votre ordinateur)."
            }
            value={value}
            onSelect={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            className="w-full p-4 bg-[#060D17] border border-[#1E3050] rounded-xl text-sm text-white placeholder-[#4B5E78] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] leading-relaxed font-serif-book shadow-inner min-h-[260px]"
          />

          {/* Inline Images Gallery Preview Strip if images exist */}
          {imageCount > 0 && (
            <div className="p-3.5 bg-[#070F1C] border border-[#1E3050] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#93C5FD]">
                  <ImageIcon className="w-4 h-4 text-[#60A5FA]" />
                  <span>Images insérées dans le texte ({imageCount})</span>
                </div>
                <span className="text-[11px] text-[#7188A8]">
                  Espace vertical réservé automatiquement lors de la mise en page
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {blocks
                  .filter((b): b is ImageBlock => b.type === 'image')
                  .map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-[#0D1829] border border-[#23385B] rounded-xl p-2.5 space-y-2 flex flex-col justify-between"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative rounded-lg overflow-hidden bg-black/40 aspect-video flex items-center justify-center border border-[#1A2A44]">
                        <img
                          src={img.url}
                          alt={img.alt || 'Illustration'}
                          className="w-full h-full object-cover rounded"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewImage(img.url)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          title="Agrandir l'image"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Caption Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#7E95B8] uppercase font-mono block">
                          Légende (Optionnelle) :
                        </label>
                        <input
                          type="text"
                          value={img.caption || ''}
                          placeholder="Ex: Figure 1 : Schéma explicatif..."
                          onChange={(e) => handleUpdateCaption(img.url, e.target.value)}
                          className="w-full px-2 py-1 bg-[#060D17] border border-[#203456] rounded text-xs text-white placeholder-[#455770] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        />
                      </div>

                      {/* Delete action */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1C2C47]">
                        <span className="text-[10px] text-[#5D7392] font-mono">
                          Image #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.url)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-red-950/40"
                          title="Supprimer cette image du texte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Raw Markdown/Code Mode */
        <div className="space-y-2">
          <div className="text-[11px] text-[#7E95B8]">
            Édition directe en syntaxe Markdown : les images sont représentées par <code>![légende](url)</code>.
          </div>
          <textarea
            ref={textareaRef}
            rows={14}
            required
            value={value}
            onSelect={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            className="w-full p-4 bg-[#060D17] border border-[#1E3050] rounded-xl text-xs sm:text-sm font-mono text-[#D1E1FA] placeholder-[#4B5E78] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] leading-relaxed shadow-inner"
          />
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {selectedPreviewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#0B1524] border border-[#2E4374] rounded-2xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E3050] pb-2">
              <span className="text-xs font-semibold text-[#93C5FD]">Aperçu de l'image insérée</span>
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-[#1E3050] text-[#93C5FD] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center">
              <img
                src={selectedPreviewImage}
                alt="Aperçu grand format"
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
