import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  RotateCcw,
  Check,
  Camera,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { uploadToSupabaseStorage, DEFAULT_30_SLOT_MOCKUPS } from "../lib/supabase";

interface TenantPhotoLightboxProps {
  photos: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  isEditable?: boolean;
  tenantName?: string;
  onReplacePhoto?: (slotIndex: number, newPhotoUrl: string) => Promise<void> | void;
  onResetToMockup?: (slotIndex: number) => Promise<void> | void;
}

export default function TenantPhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  isEditable = false,
  tenantName,
  onReplacePhoto,
  onResetToMockup
}: TenantPhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Touch Swipe Gesture State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 45;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || DEFAULT_30_SLOT_MOCKUPS[currentIndex] || DEFAULT_30_SLOT_MOCKUPS[0];
  const isDefaultMockup = currentPhoto === DEFAULT_30_SLOT_MOCKUPS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setUploadSuccess(null);
    setShowUrlInput(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setUploadSuccess(null);
    setShowUrlInput(false);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(null);

    // Instant optimistic preview with local object URL so change reflects right away
    const localUrl = URL.createObjectURL(file);
    if (onReplacePhoto) {
      try {
        await onReplacePhoto(currentIndex, localUrl);
      } catch (e) {
        console.warn("Optimistic local preview applied");
      }
    }

    try {
      const publicUrl = await uploadToSupabaseStorage(file);
      if (onReplacePhoto) {
        await onReplacePhoto(currentIndex, publicUrl);
      }
      setUploadSuccess(`Slot ${currentIndex + 1} updated with your photo!`);
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      if (onReplacePhoto) {
        await onReplacePhoto(currentIndex, urlInput.trim());
      }
      setUploadSuccess(`Slot ${currentIndex + 1} updated!`);
      setTimeout(() => setUploadSuccess(null), 3000);
      setShowUrlInput(false);
      setUrlInput("");
    } catch (err) {
      alert("Failed to update photo URL.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    if (onResetToMockup) {
      await onResetToMockup(currentIndex);
      setUploadSuccess(`Slot ${currentIndex + 1} reset to default mockup.`);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2800] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Bar: Position, Set info, Edit badge & Clear Close (X) button */}
      <div
        className="flex items-center justify-between text-white z-20 pb-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {/* Position in Set e.g. "7 / 30" */}
          <div className="flex items-center gap-2 bg-slate-900/95 border-2 border-emerald-500/70 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="text-xs sm:text-sm font-mono font-black text-emerald-400">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-white">
                {currentIndex === 0 ? "Cover Photo (Slot 1)" : `Showcase Slot ${currentIndex + 1}`}
              </span>
              {isEditable && (
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    isDefaultMockup
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm"
                  }`}
                >
                  {isDefaultMockup ? "Mockup" : "Custom Photo"}
                </span>
              )}
            </div>
            {tenantName && (
              <span className="text-[11px] text-slate-400 font-medium">
                {tenantName}'s Space
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border border-slate-600 cursor-pointer shadow-xl"
            title="Return to grid (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Previous & Next Navigation */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-1 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/85 hover:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 hover:border-emerald-400 shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Previous photo (←)"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Full Image */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={`Showcase slot ${currentIndex + 1}`}
            className="max-w-full max-h-[68dvh] sm:max-h-[74dvh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)] border border-slate-800 transition-all duration-200 animate-fade-in"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                DEFAULT_30_SLOT_MOCKUPS[currentIndex] || DEFAULT_30_SLOT_MOCKUPS[0];
            }}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/85 hover:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 hover:border-emerald-400 shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Next photo (→)"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Bottom Bar: Action & Position Navigation Strip */}
      <div
        className="flex flex-col gap-2 z-20 pt-2 max-w-2xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {uploadSuccess && (
          <div className="p-2.5 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-mono text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{uploadSuccess}</span>
          </div>
        )}

        {isEditable ? (
          /* Tenant Edit Controls (Replace Photo directly from large view) */
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Slot #{currentIndex + 1} Review & Actions</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {isDefaultMockup ? "(Default Mockup)" : "(Your Uploaded Photo)"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isDefaultMockup && (
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    title="Reset this slot to standard mockup placeholder"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Mockup</span>
                  </button>
                )}

                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Paste URL</span>
                </button>

                {/* Primary Replace Photo Button - Opens Phone Photo Picker */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Replace Photo</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Optional URL Input */}
            {showUrlInput && (
              <form onSubmit={handleUrlSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isUploading || !urlInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Save URL
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Customer Navigation Hint */
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <span>Swipe or click arrows to browse</span>
            </span>
            <span className="font-mono text-emerald-400">
              Photo {currentIndex + 1} of {photos.length}
            </span>
          </div>
        )}

        {/* Mini 30-Slot Thumbnail Strip for quick jumping */}
        <div className="flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none items-center justify-start sm:justify-center">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setUploadSuccess(null);
                setShowUrlInput(false);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                i === currentIndex
                  ? "border-emerald-400 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                  : "border-slate-800 opacity-60 hover:opacity-100"
              }`}
              title={`Jump to slot ${i + 1}`}
            >
              <img
                src={p || DEFAULT_30_SLOT_MOCKUPS[i]}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_30_SLOT_MOCKUPS[i] || DEFAULT_30_SLOT_MOCKUPS[0];
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
