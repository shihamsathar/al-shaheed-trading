import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Link,
  Trash2,
  Eye,
  Star,
  Plus,
  Sparkles,
  X,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

export interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
  subtitle?: string;
  required?: boolean;
  allowCamera?: boolean;
  allowPresets?: boolean;
  category?: 'scrap' | 'document' | 'general';
}

const SCRAP_SAMPLE_PRESETS = [
  {
    name: 'HMS 1/2 Heavy Melting Steel',
    category: 'Ferrous Metals',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Copper Millberry Wire 99.9%',
    category: 'Non-Ferrous Metals',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Aluminium UBC Bales & Extrusion',
    category: 'Non-Ferrous Metals',
    url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'OCC Baled Corrugated Cardboard',
    category: 'Paper & Fiber',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Industrial Heavy Equipment & Scrap',
    category: 'Machinery & Surplus',
    url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Marine Container Stuffing & Yard',
    category: 'Logistics / Port Yard',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Steel Mill Scrap Furnace Feed',
    category: 'Ferrous Scrap',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Warehouse Material Stockpile',
    category: 'Storage / Yard',
    url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1000&q=80',
  },
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos = [],
  onChange,
  maxPhotos = 12,
  label = 'Material & Yard Photos',
  subtitle = 'Take high-res photos via phone camera, upload from desktop, or drag & drop',
  required = false,
  allowCamera = true,
  allowPresets = true,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Handle local file uploads (desktop or phone gallery)
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`Maximum limit of ${maxPhotos} photos reached.`);
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange([...photos, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // reset input so the same file can be selected again if desired
    if (e.target) e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (photos.length >= maxPhotos) {
      alert(`Maximum limit of ${maxPhotos} photos reached.`);
      return;
    }
    onChange([...photos, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetAsPrimary = (index: number) => {
    if (index === 0) return;
    const selected = photos[index];
    const updated = [selected, ...photos.filter((_, i) => i !== index)];
    onChange(updated);
  };

  const handleAddPreset = (url: string) => {
    if (photos.length >= maxPhotos) {
      alert(`Maximum limit of ${maxPhotos} photos reached.`);
      return;
    }
    onChange([...photos, url]);
    setShowPresetsModal(false);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Live Camera WebRTC Handlers (Desktop & Web)
  const startLiveCamera = async () => {
    setCameraError(null);
    setIsLiveCameraOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        // Fallback to native camera input
        setIsLiveCameraOpen(false);
        cameraInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Live camera stream not accessible, triggering native input', err);
      setIsLiveCameraOpen(false);
      // Automatically fallback to mobile device camera capture input
      cameraInputRef.current?.click();
    }
  };

  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (photos.length < maxPhotos) {
        onChange([...photos, dataUrl]);
      }
    }
    stopLiveCamera();
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden Native File Inputs */}
      {/* 1. Desktop & Mobile File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        multiple
        className="hidden"
        id="photo-file-upload-input"
      />

      {/* 2. Direct Camera Trigger for Mobile Phones */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        id="photo-camera-upload-input"
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {label} {required && <span className="text-rose-500">*</span>}
            </h4>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {photos.length} / {maxPhotos} Photos
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile/Phone Direct Camera Button */}
          {allowCamera && (
            <button
              type="button"
              onClick={() => {
                // Check if user is on mobile or prefers direct camera
                if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
                  cameraInputRef.current?.click();
                } else {
                  startLiveCamera();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Take photo with phone camera or webcam"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo</span>
            </button>
          )}

          {/* Upload from Device / Computer */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Choose photos from your computer or phone library"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Files</span>
          </button>

          {/* Quick Presets Library */}
          {allowPresets && (
            <button
              type="button"
              onClick={() => setShowPresetsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Select authentic scrap photos from Al Shaheed asset library"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Scrap Presets</span>
              <span className="sm:hidden">Presets</span>
            </button>
          )}

          {/* Add by Link URL */}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Paste image link URL"
          >
            <Link className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl animate-in fade-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (e.g. https://...)"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag and Drop Zone or Empty State */}
      {photos.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 bg-slate-50/70 dark:bg-slate-950/50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
              Click to take photo with phone camera or upload files
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Drag and drop photos here from desktop • JPG, PNG, WEBP up to 25MB each
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
              📸 Phone Camera Support
            </span>
            <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
              💻 Desktop Multi-Upload
            </span>
          </div>
        </div>
      ) : (
        /* Photo Thumbnails Grid */
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5"
          >
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 dark:border-slate-800 aspect-4/3 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                {/* Photo Image */}
                <img
                  src={photo}
                  alt={`Material Lot Photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  {idx === 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Cover
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white font-bold text-[10px] shadow-md">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5 z-20">
                  <div className="flex items-center gap-1.5">
                    {/* View Fullscreen */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage(photo)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer"
                      title="View high-resolution"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Set As Cover */}
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetAsPrimary(idx)}
                        className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                        title="Set as main cover photo"
                      >
                        <Star className="w-3 h-3" />
                        <span>Cover</span>
                      </button>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    title="Remove this photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add More Card */}
            {photos.length < maxPhotos && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/20 aspect-4/3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-500 hover:text-emerald-600"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">+ Add More</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live WebCam Snapshot Modal (Desktop / Live Stream) */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Live Camera Capture</h3>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-3 flex justify-center z-10">
                <button
                  type="button"
                  onClick={captureLiveSnapshot}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Snap Photo</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Point camera at scrap material or inspection badge</span>
              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  cameraInputRef.current?.click();
                }}
                className="text-emerald-400 underline font-semibold cursor-pointer"
              >
                Use Phone Camera File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Library Quick Selector Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Al Shaheed Scrap Photography Library
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select authentic industry scrap &amp; yard photos to attach instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SCRAP_SAMPLE_PRESETS.map((preset, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => handleAddPreset(preset.url)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500 aspect-4/3 cursor-pointer shadow-xs transition-all flex flex-col justify-end"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="relative z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-2.5 text-white">
                    <span className="text-[10px] font-bold text-emerald-400 block">
                      {preset.category}
                    </span>
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {preset.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="High resolution scrap inspection"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
