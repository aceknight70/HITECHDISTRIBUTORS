import React, { useState, useEffect } from "react";
import {
  Store,
  Camera,
  Box,
  DollarSign,
  X,
  Upload,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info
} from "lucide-react";
import * as db from "./lib/supabase";
import { HubTenant, HubTenantProduct, HubTenantCommission, uploadToSupabaseStorage, DEFAULT_30_SLOT_MOCKUPS } from "./lib/supabase";
import TenantPhotoLightbox from "./components/TenantPhotoLightbox";

interface TenantSelfServiceProps {
  initialTenant?: HubTenant | null;
  onClose: () => void;
  onTenantUpdated?: (updated: HubTenant) => void;
  onOpenStorefront?: (tenant: HubTenant) => void;
}

export default function TenantSelfService({
  initialTenant,
  onClose,
  onTenantUpdated,
  onOpenStorefront
}: TenantSelfServiceProps) {
  // Authentication state
  const [authenticatedTenant, setAuthenticatedTenant] = useState<HubTenant | null>(initialTenant || null);
  const [inputCode, setInputCode] = useState(initialTenant ? initialTenant.referral_code : "");
  const [loginError, setLoginError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"gallery" | "products" | "earnings">("gallery");

  // Gallery state (30 slots)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);
  const [slotPhotoUrlInput, setSlotPhotoUrlInput] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [gallerySaveNotice, setGallerySaveNotice] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<HubTenantProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HubTenantProduct | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<{
    id?: string;
    product_name: string;
    price: string;
    description: string;
    category: string;
    photo_url: string;
    in_stock: boolean;
  }>({
    product_name: "",
    price: "",
    description: "",
    category: "",
    photo_url: "",
    in_stock: true
  });
  const [productSaveError, setProductSaveError] = useState("");

  // Earnings state
  const [commissions, setCommissions] = useState<HubTenantCommission[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  // Load tenant data when authenticated
  useEffect(() => {
    if (authenticatedTenant) {
      loadTenantProducts(authenticatedTenant.id);
      loadTenantCommissions(authenticatedTenant.id);
    }
  }, [authenticatedTenant]);

  const loadTenantProducts = async (tenantId: string) => {
    setLoadingProducts(true);
    try {
      const prods = await db.fetchTenantProducts(tenantId);
      setProducts(prods);
    } catch (e) {
      console.error("Error loading tenant products:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadTenantCommissions = async (tenantId: string) => {
    setLoadingCommissions(true);
    try {
      const comms = await db.fetchTenantCommissions(tenantId);
      setCommissions(comms);
    } catch (e) {
      console.error("Error loading tenant commissions:", e);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setLoginError("Please enter your PIN or referral code.");
      return;
    }

    setIsVerifying(true);
    setLoginError("");

    try {
      const allTenants = await db.fetchHubTenants();
      const match = db.findMatchingTenant(allTenants, code);

      if (match) {
        setAuthenticatedTenant(match);
        setLoginError("");
      } else {
        const availableCodes = allTenants.filter(t => t.status === 'active').map(t => {
          const pinNotice = t.pin ? ` (PIN: ${t.pin})` : ` (${t.referral_code})`;
          return `${t.tenant_name.split(" ")[0]}${pinNotice}`;
        }).join(", ");
        setLoginError(`PIN or Code "${code}" was not found. Try entering PIN 4444 for Favour, or select a registered merchant: ${availableCodes || "Favour (PIN: 4444), Martins (MARTINSQW13), Sumshi (SUMSHI)"}`);
      }
    } catch (err) {
      setLoginError("Error verifying PIN or code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Save photo to a specific slot index immediately
  const handleSaveSlotPhotoByIndex = async (slotIndex: number, newUrl: string) => {
    if (!authenticatedTenant || slotIndex < 0 || slotIndex >= 30) return;

    const currentPhotos = [...authenticatedTenant.photos];
    currentPhotos[slotIndex] = newUrl.trim();

    const updatedTenant: HubTenant = {
      ...authenticatedTenant,
      photos: currentPhotos
    };

    // Update state immediately so UI updates without delay
    setAuthenticatedTenant(updatedTenant);
    await db.saveHubTenant(updatedTenant);
    if (onTenantUpdated) onTenantUpdated(updatedTenant);

    setGallerySaveNotice(`Slot ${slotIndex + 1} updated with your photo!`);
    setTimeout(() => setGallerySaveNotice(null), 3000);
  };

  const handleDirectSlotUpload = async (slotIndex: number, file: File) => {
    if (!authenticatedTenant) return;
    setIsUploadingPhoto(true);

    // Instant optimistic preview with local object URL
    const localUrl = URL.createObjectURL(file);
    const optimisticPhotos = [...authenticatedTenant.photos];
    optimisticPhotos[slotIndex] = localUrl;
    const optimisticTenant: HubTenant = {
      ...authenticatedTenant,
      photos: optimisticPhotos
    };
    setAuthenticatedTenant(optimisticTenant);
    if (onTenantUpdated) onTenantUpdated(optimisticTenant);

    try {
      const publicUrl = await uploadToSupabaseStorage(file);
      await handleSaveSlotPhotoByIndex(slotIndex, publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Replace individual photo slot (1-30) modal flow
  const handleSaveSlotPhoto = async (newUrl: string) => {
    if (replacingSlotIndex === null) return;
    await handleSaveSlotPhotoByIndex(replacingSlotIndex, newUrl);
    setReplacingSlotIndex(null);
    setSlotPhotoUrlInput("");
  };

  const handleResetSlotToDefault = async (slotIndex: number) => {
    if (!authenticatedTenant) return;
    const defaultMockup = DEFAULT_30_SLOT_MOCKUPS[slotIndex] || DEFAULT_30_SLOT_MOCKUPS[0];
    const currentPhotos = [...authenticatedTenant.photos];
    currentPhotos[slotIndex] = defaultMockup;

    const updatedTenant: HubTenant = {
      ...authenticatedTenant,
      photos: currentPhotos
    };

    setAuthenticatedTenant(updatedTenant);
    await db.saveHubTenant(updatedTenant);
    if (onTenantUpdated) onTenantUpdated(updatedTenant);

    setGallerySaveNotice(`Slot ${slotIndex + 1} reset to default mockup.`);
    setTimeout(() => setGallerySaveNotice(null), 3000);
    setReplacingSlotIndex(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingSlotIndex === null || !authenticatedTenant) return;

    setIsUploadingPhoto(true);
    // Instant optimistic preview
    const localUrl = URL.createObjectURL(file);
    const optimisticPhotos = [...authenticatedTenant.photos];
    optimisticPhotos[replacingSlotIndex] = localUrl;
    const optimisticTenant: HubTenant = {
      ...authenticatedTenant,
      photos: optimisticPhotos
    };
    setAuthenticatedTenant(optimisticTenant);
    if (onTenantUpdated) onTenantUpdated(optimisticTenant);

    try {
      const publicUrl = await uploadToSupabaseStorage(file);
      await handleSaveSlotPhoto(publicUrl);
    } catch (err: any) {
      alert("Failed to upload image. Please try pasting an image URL instead.");
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedTenant) return;
    if (!productForm.product_name.trim()) {
      setProductSaveError("Product name is required.");
      return;
    }

    const priceNum = productForm.price.trim() !== "" ? parseFloat(productForm.price) : null;
    const newOrUpdated: HubTenantProduct = {
      id: productForm.id || `prod-${Date.now()}-${Math.random().toString(36).substring(6)}`,
      tenant_id: authenticatedTenant.id,
      product_name: productForm.product_name.trim(),
      price: priceNum,
      description: productForm.description.trim(),
      category: productForm.category.trim() || authenticatedTenant.category,
      photo_url: productForm.photo_url.trim() || DEFAULT_30_SLOT_MOCKUPS[0],
      in_stock: productForm.in_stock,
      date_added: new Date().toISOString()
    };

    await db.saveTenantProduct(newOrUpdated);
    await loadTenantProducts(authenticatedTenant.id);

    setIsAddingProduct(false);
    setEditingProduct(null);
    setProductForm({
      product_name: "",
      price: "",
      description: "",
      category: "",
      photo_url: "",
      in_stock: true
    });
    setProductSaveError("");
  };

  const handleToggleProductStock = async (product: HubTenantProduct) => {
    const updated = { ...product, in_stock: !product.in_stock };
    await db.saveTenantProduct(updated);
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from your storefront catalogue?`)) {
      return;
    }
    await db.deleteTenantProduct(productId);
    if (authenticatedTenant) {
      await loadTenantProducts(authenticatedTenant.id);
    }
  };

  // Earnings calculations
  const totalEarned = commissions.reduce((sum, c) => sum + (c.status !== "Reversed" ? Number(c.commission_amount) : 0), 0);
  const totalPaid = commissions.reduce((sum, c) => sum + (c.status === "Paid" ? Number(c.commission_amount) : 0), 0);
  const totalPending = commissions.reduce((sum, c) => sum + (c.status === "Pending" ? Number(c.commission_amount) : 0), 0);
  const totalReversed = commissions.reduce((sum, c) => sum + (c.status === "Reversed" ? Number(c.commission_amount) : 0), 0);

  // Render Login Modal if not authenticated
  if (!authenticatedTenant) {
    return (
      <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-emerald-400 shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Tenant Self-Service</h3>
              <p className="text-[11px] text-emerald-400 font-mono">Merchant Control Center</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 mb-5 text-slate-200 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct PIN / Code Access — No Password Required</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No password is demanded. Enter your assigned <strong>PIN</strong> (e.g. <strong>4444</strong> for Favour Atigolo) or your Referral Code to enter your workspace and work immediately.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Tenant PIN or Referral Code *
                </label>
                <span className="text-[10px] font-semibold text-emerald-400 font-mono">No password required</span>
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={e => {
                  setInputCode(e.target.value.toUpperCase());
                  setLoginError("");
                }}
                placeholder="Enter PIN (e.g. 4444 for Favor) or Referral Code"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-3 text-sm font-mono text-white tracking-widest uppercase outline-none placeholder:text-slate-600"
                autoFocus
              />

              {/* Quick Direct Access Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Select:</span>
                {[
                  { name: "Favour Atigolo", code: "4444", label: "Favour (PIN: 4444)" },
                  { name: "Martins", code: "MARTINSQW13", label: "Martins (MARTINSQW13)" },
                  { name: "Sumshi", code: "SUMSHI", label: "Sumshi (SUMSHI)" }
                ].map(demo => (
                  <button
                    key={demo.code}
                    type="button"
                    onClick={async () => {
                      setInputCode(demo.code);
                      setIsVerifying(true);
                      setLoginError("");
                      try {
                        const all = await db.fetchHubTenants();
                        const match = db.findMatchingTenant(all, demo.code);
                        if (match) {
                          setAuthenticatedTenant(match);
                        }
                      } finally {
                        setIsVerifying(false);
                      }
                    }}
                    className="text-[10px] font-mono font-bold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 hover:border-emerald-400 text-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN / Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Workspace (No Password Demanded)</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              HiTech Hublet Rented Storefront Infrastructure • PIN / Code Access
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Dashboard once authenticated
  return (
    <div className="fixed inset-0 z-[2400] w-full h-[100dvh] max-h-[100dvh] overflow-y-auto bg-slate-950 text-slate-100 flex flex-col font-sans select-text">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-800 flex-shrink-0 flex items-center justify-center">
            {authenticatedTenant.photos && authenticatedTenant.photos[0] ? (
              <img src={authenticatedTenant.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white uppercase truncate">
                {authenticatedTenant.tenant_name}
              </h2>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
                Merchant Owner
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>Code: <strong className="text-emerald-400">{authenticatedTenant.referral_code}</strong></span>
              {authenticatedTenant.pin && (
                <>
                  <span>•</span>
                  <span>PIN: <strong className="text-emerald-300 font-bold">{authenticatedTenant.pin}</strong></span>
                </>
              )}
              <span>•</span>
              <span>Comm: {authenticatedTenant.commission_rate ?? 1.0}%</span>
              {authenticatedTenant.pixel_id && (
                <>
                  <span>•</span>
                  <span className="text-blue-400">Pixel Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStorefront && (
            <button
              onClick={() => onOpenStorefront(authenticatedTenant)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview how customers see your storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Live</span> Storefront
            </button>
          )}
          <button
            onClick={() => {
              setAuthenticatedTenant(null);
              setInputCode("");
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`py-3 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "gallery"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>My Gallery (30 Photo Slots)</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "products"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Box className="w-4 h-4" />
            <span>My Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`py-3 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "earnings"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>My Earnings (₦{totalEarned.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-grow flex flex-col gap-6 pb-24">
        {gallerySaveNotice && (
          <div className="p-3 bg-emerald-950 border border-emerald-600 text-emerald-300 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{gallerySaveNotice}</span>
            </span>
            <button onClick={() => setGallerySaveNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ---------------- TAB 1: MY GALLERY (30 PHOTO SLOTS) ---------------- */}
        {activeTab === "gallery" && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span>30-Slot Storefront Photo Showcase</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every rented space starts complete with all 30 slots pre-filled with high-grade mockups. Tap any individual slot to replace it with your own real product or brand photo. Unreplaced slots continue to show their default mockup so your storefront always looks full and professional.
                </p>
              </div>
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3 flex-shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">Customized Slots</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {authenticatedTenant.photos.filter((p, i) => p !== DEFAULT_30_SLOT_MOCKUPS[i]).length} / 30
                </span>
              </div>
            </div>

            {/* 30 Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {authenticatedTenant.photos.map((photoUrl, idx) => {
                const isDefault = photoUrl === DEFAULT_30_SLOT_MOCKUPS[idx];
                const isSlotBeingReplaced = replacingSlotIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col transition-all shadow-md ${
                      isSlotBeingReplaced
                        ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header with Slot Number & Status Badge */}
                    <div className="px-2.5 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-white">
                        Slot #{idx + 1} {idx === 0 && "(Cover)"}
                      </span>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isDefault
                            ? "bg-slate-800 text-slate-400"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        }`}
                      >
                        {isDefault ? "Mockup" : "Custom"}
                      </span>
                    </div>

                    {/* Image Preview - Tapping opens full-screen lightbox at full size */}
                    <div
                      onClick={() => setLightboxIndex(idx)}
                      className="relative aspect-square bg-slate-950 overflow-hidden group cursor-pointer"
                      title="Tap to review photo at full size"
                    >
                      <img
                        src={photoUrl}
                        alt={`Slot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                          (e.target as HTMLImageElement).src = DEFAULT_30_SLOT_MOCKUPS[idx] || DEFAULT_30_SLOT_MOCKUPS[0];
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                        <span className="px-2.5 py-1 bg-slate-900/95 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-md">
                          🔍 Review Full Size
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow">
                          Tap to Enlarge / Swap
                        </span>
                      </div>
                    </div>

                    {/* Actions - Prominent direct 'Replace Photo' button opening phone photo picker */}
                    <div className="p-2 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-1.5">
                      <label className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>Replace Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleDirectSlotUpload(idx, file);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      <div className="flex gap-1 justify-between">
                        <button
                          onClick={() => setLightboxIndex(idx)}
                          className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Enlarge
                        </button>
                        <button
                          onClick={() => {
                            setReplacingSlotIndex(idx);
                            setSlotPhotoUrlInput(photoUrl);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold uppercase transition-colors"
                          title="Paste image URL"
                        >
                          URL
                        </button>
                        {!isDefault && (
                          <button
                            onClick={() => handleResetSlotToDefault(idx)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded text-[9px] transition-colors"
                            title="Reset to default mockup"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full-Screen Lightbox with Replace Action directly from large view */}
            <TenantPhotoLightbox
              photos={authenticatedTenant.photos}
              initialIndex={lightboxIndex ?? 0}
              isOpen={lightboxIndex !== null}
              onClose={() => setLightboxIndex(null)}
              isEditable={true}
              tenantName={authenticatedTenant.tenant_name}
              onReplacePhoto={async (slotIdx, newUrl) => {
                await handleSaveSlotPhotoByIndex(slotIdx, newUrl);
              }}
              onResetToMockup={async (slotIdx) => {
                await handleResetSlotToDefault(slotIdx);
              }}
            />

            {/* Replace Photo Modal */}
            {replacingSlotIndex !== null && (
              <div className="fixed inset-0 z-[2600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Update Photo Slot #{replacingSlotIndex + 1} {replacingSlotIndex === 0 && "(Cover / Main Avatar)"}</span>
                    </h4>
                    <button
                      onClick={() => setReplacingSlotIndex(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-32 h-32 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                      <img
                        src={slotPhotoUrlInput || DEFAULT_30_SLOT_MOCKUPS[replacingSlotIndex]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = DEFAULT_30_SLOT_MOCKUPS[replacingSlotIndex];
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2 w-full">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Option 1: Upload from Phone / Device
                      </label>
                      <label className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingPhoto ? "Uploading..." : "Choose Image File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploadingPhoto}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Option 2: Or Paste Photo URL
                    </label>
                    <input
                      type="url"
                      value={slotPhotoUrlInput}
                      onChange={e => setSlotPhotoUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleResetSlotToDefault(replacingSlotIndex)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      Use Mockup
                    </button>
                    <button
                      onClick={() => setReplacingSlotIndex(null)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSlotPhoto(slotPhotoUrlInput)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      Save Slot Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- TAB 2: MY PRODUCTS ---------------- */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-5 h-5 text-emerald-400" />
                  <span>My Product Listings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage products sold directly through your storefront. Only items with <strong>In Stock = ON</strong> are visible to public customers.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    product_name: "",
                    price: "",
                    description: "",
                    category: authenticatedTenant.category,
                    photo_url: "",
                    in_stock: true
                  });
                  setIsAddingProduct(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Product Add / Edit Modal */}
            {isAddingProduct && (
              <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-emerald-400" />
                    <span>{editingProduct ? "Edit Product" : "Add New Storefront Product"}</span>
                  </h4>
                  <button
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.product_name}
                      onChange={e => setProductForm({ ...productForm, product_name: e.target.value })}
                      placeholder="e.g. The Stain Rectifier (500ml) or 5kVA Solar Inverter"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Price (₦) — Leave blank for "Price on request"
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 4500 (blank = Price on request)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g. Cleaning, Fashion, Food, Solar"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Product Photo URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={productForm.photo_url}
                        onChange={e => setProductForm({ ...productForm, photo_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                      <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadToSupabaseStorage(file);
                                setProductForm(prev => ({ ...prev, photo_url: url }));
                              } catch (err) {
                                alert("Failed to upload image.");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Description & Specs
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Describe what makes this item special, sizes, specs, and details..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      id="in_stock"
                      checked={productForm.in_stock}
                      onChange={e => setProductForm({ ...productForm, in_stock: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <label htmlFor="in_stock" className="text-xs font-bold text-slate-200 cursor-pointer">
                      In Stock (Visible and orderable in storefront)
                    </label>
                  </div>

                  {productSaveError && (
                    <div className="sm:col-span-2 p-2.5 bg-red-950/80 border border-red-800 text-red-300 rounded text-xs">
                      {productSaveError}
                    </div>
                  )}

                  <div className="sm:col-span-2 flex gap-2 justify-end pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md"
                    >
                      {editingProduct ? "Update Product" : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Product List */}
            {loadingProducts ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400 font-mono">Loading product list...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-center flex flex-col items-center gap-3">
                <Box className="w-10 h-10 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-300 uppercase">No Products Added Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Add items to your storefront catalogue so customers browsing your space can view prices, specs, and order via WhatsApp or HiTech Invoice.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4 flex flex-col gap-3 shadow-md"
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
                      {prod.photo_url ? (
                        <img src={prod.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-10 h-10 text-slate-700" />
                      )}
                      <button
                        onClick={() => handleToggleProductStock(prod)}
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-md ${
                          prod.in_stock
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {prod.in_stock ? "✓ In Stock" : "✕ Out of Stock"}
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {prod.price ? `₦${Number(prod.price).toLocaleString()}` : "Price on request"}
                        </span>
                        {prod.category && (
                          <span className="text-[8px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 uppercase font-mono">
                            {prod.category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{prod.product_name}</h4>
                      {prod.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{prod.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductForm({
                            id: prod.id,
                            product_name: prod.product_name,
                            price: prod.price ? String(prod.price) : "",
                            description: prod.description || "",
                            category: prod.category || authenticatedTenant.category,
                            photo_url: prod.photo_url || "",
                            in_stock: prod.in_stock
                          });
                          setIsAddingProduct(true);
                        }}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.product_name)}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- TAB 3: MY EARNINGS ---------------- */}
        {activeTab === "earnings" && (
          <div className="flex flex-col gap-6">
            {/* Header info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span>My Commission & Sales Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every order placed or invoice issued with your promo code (<strong>{authenticatedTenant.referral_code}</strong>) logs directly to this ledger with an automatic {authenticatedTenant.commission_rate ?? 1.0}% commission.
                </p>
              </div>
              <button
                onClick={() => loadTenantCommissions(authenticatedTenant.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5 self-start sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Ledger</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Commission</span>
                <h4 className="text-xl font-black text-emerald-400 mt-1 font-mono">
                  ₦{totalEarned.toLocaleString()}
                </h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paid Out</span>
                <h4 className="text-xl font-black text-blue-400 mt-1 font-mono">
                  ₦{totalPaid.toLocaleString()}
                </h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Payout</span>
                <h4 className="text-xl font-black text-amber-400 mt-1 font-mono">
                  ₦{totalPending.toLocaleString()}
                </h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reversed</span>
                <h4 className="text-xl font-black text-slate-500 mt-1 font-mono">
                  ₦{totalReversed.toLocaleString()}
                </h4>
              </div>
            </div>

            {/* Commission Ledger Table / List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Transaction History</span>
                <span className="text-[10px] font-mono text-slate-400">{commissions.length} entries</span>
              </div>

              {loadingCommissions ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-mono">Loading commission transactions...</span>
                </div>
              ) : commissions.length === 0 ? (
                <div className="py-12 px-6 text-center flex flex-col items-center gap-2">
                  <DollarSign className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-400 font-medium">No sales attributed to code {authenticatedTenant.referral_code} yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Tell customers your code when they visit the store, or share your storefront link. When staff issues receipts with your code, commissions will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-800">
                  {commissions.map(comm => (
                    <div key={comm.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">#{comm.invoice_reference}</span>
                          <span className="text-slate-300 font-semibold">• {comm.customer_name || "Customer"}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {comm.created_at ? new Date(comm.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Sale Amount: ₦{Number(comm.sale_amount).toLocaleString()} @ {comm.commission_rate_applied}% = <strong className="text-emerald-400 font-mono font-bold">₦{Number(comm.commission_amount).toLocaleString()}</strong>
                        </p>
                        {comm.reversal_reason && (
                          <p className="text-[10px] text-red-400 font-mono mt-0.5">
                            Reversal Note: {comm.reversal_reason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            comm.status === "Paid"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : comm.status === "Reversed"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {comm.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
