import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  title?: string;
  subtitle?: string;
  initialIndex?: number;
}

/**
 * Downloads a single image to the user's computer or mobile device.
 * Uses fetch blob for proper download attributes, with a fallback to direct link.
 */
export const downloadImage = async (url: string, filename: string) => {
  try {
    if (url.startsWith('data:')) {
      // Data URL download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    // Direct link fallback
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  photos = [],
  title = 'Scrap Lot Inspection Photos',
  subtitle,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, photos.length - 1)));
      setIsZoomed(false);
      setDownloadSuccess(null);
    }
  }, [isOpen, initialIndex, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const safeTitle = (title || 'scrap-lot').replace(/[^a-zA-Z0-9_-]/g, '_');

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleDownloadCurrent = () => {
    const filename = `${safeTitle}-photo-${currentIndex + 1}.jpg`;
    downloadImage(currentPhoto, filename);
    setDownloadSuccess(`Downloaded Photo ${currentIndex + 1}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    setDownloadSuccess(null);
    try {
      for (let i = 0; i < photos.length; i++) {
        const filename = `${safeTitle}-photo-${i + 1}-of-${photos.length}.jpg`;
        await downloadImage(photos[i], filename);
        // Stagger downloads slightly so browser doesn't block multi-download
        await new Promise((res) => setTimeout(res, 250));
      }
      setDownloadSuccess(`All ${photos.length} photos downloaded!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch {
      setDownloadSuccess('Started download sequence.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div
      id="photo-gallery-lightbox-modal"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono font-bold border border-slate-700">
                {currentIndex + 1} / {photos.length}
              </span>
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate max-w-md sm:max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {downloadSuccess && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {downloadSuccess}
            </span>
          )}

          {/* Download Current Photo Button */}
          <button
            id="download-current-photo-btn"
            type="button"
            onClick={handleDownloadCurrent}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
            title="Download this picture"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Download Photo</span>
            <span className="sm:hidden">Save</span>
          </button>

          {/* Download All Photos Button */}
          <button
            id="download-all-photos-btn"
            type="button"
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Download all pictures of this scrap lot"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isDownloadingAll ? 'Downloading...' : `Download All (${photos.length})`}
            </span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 ml-1"
            title="Close Gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main High-Res Viewer */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              id="gallery-prev-btn"
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              id="gallery-next-btn"
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* The Image Itself */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentPhoto}
            alt={`${title} - Photo ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[68vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800 bg-black/40"
          />

          {/* Quick Zoom Indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-sm cursor-pointer"
            title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Thumbnails Ribbon at Bottom */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1 flex-1">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105 shadow-md'
                    : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded-xs">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono flex-shrink-0 pl-2">
            <span>Keys: [←] Prev • [→] Next • [Esc] Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
