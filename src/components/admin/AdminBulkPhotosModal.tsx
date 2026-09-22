import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PhotoUploader } from '../common/PhotoUploader';
import { PhotoGalleryModal } from '../common/PhotoGalleryModal';
import { ScrapListing } from '../../types';
import { api } from '../../services/api';
import {
  Camera,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Image as ImageIcon
} from 'lucide-react';

export interface AdminBulkPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ScrapListing | null;
  onPhotosUpdated: (updatedListing: ScrapListing) => void;
}

export const AdminBulkPhotosModal: React.FC<AdminBulkPhotosModalProps> = ({
  isOpen,
  onClose,
  listing,
  onPhotosUpdated,
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  React.useEffect(() => {
    if (listing && isOpen) {
      setPhotos(listing.photos || []);
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const handleSavePhotos = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await api.updateListingPhotos(listing.id, photos);
      setSuccessMsg(`Successfully saved ${photos.length} photos to lot #${listing.id}!`);
      onPhotosUpdated(updated);
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save photos to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Admin Bulk Photo Manager`}
        subtitle={`Lot #${listing.id}: ${listing.materialName} (${listing.quantity} ${listing.quantityUnit})`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Admin Scrap Media Desk
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Add, upload, and manage bulk high-resolution yard inspection photos. Buyers and agents will be able to view all images in high definition and download them individually or in bulk.
              </p>
            </div>

            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Gallery ({photos.length})</span>
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Uploader Component with Bulk Uploads */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl">
            <PhotoUploader
              photos={photos}
              onChange={(newPhotos) => setPhotos(newPhotos)}
              maxPhotos={40}
              label={`Lot Photos (${photos.length} uploaded)`}
              subtitle="Select multiple images from computer, phone camera, drag-and-drop, or inject sample scrap photos"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span>Total Photos: </span>
              <strong className="text-white font-mono">{photos.length}</strong>
              <span className="text-slate-500 ml-1">(Supported: JPG, PNG, WEBP)</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                id="save-bulk-photos-btn"
                type="button"
                onClick={handleSavePhotos}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Photos...' : `Save Photos to Lot (${photos.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Fullscreen Photo Gallery Preview */}
      <PhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={photos}
        title={listing.materialName}
        subtitle={`Lot #${listing.id} • ${listing.quantity} ${listing.quantityUnit} • Grade: ${listing.grade}`}
      />
    </>
  );
};
