import React, { useState, useEffect, useRef } from "react";
import {
  Laptop,
  Printer,
  Monitor,
  Camera,
  Shield,
  Network,
  Tv,
  Cpu,
  FolderPlus,
  Sun,
  Home,
  MessageSquare,
  ShoppingCart,
  Wrench,
  Tag,
  FileText,
  HelpCircle,
  Mail,
  Star,
  Clock,
  Lock,
  ChevronRight,
  Upload,
  AlertTriangle,
  Send,
  Calendar,
  CheckCircle,
  Search,
  Sliders,
  PhoneCall,
  User,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Video,
  Eye,
  MapPin,
  Building,
  Info,
  Database,
  X,
  Zap,
  Smartphone,
  Box,
  Loader2,
  Settings,
  Save,
  GitCompare,
  Facebook,
  Instagram,
  Globe,
  Download,
  MessageCircle,
  GraduationCap,
  Play,
  Edit,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, base64ToBlob, uploadToSupabaseStorage } from "./lib/supabase";
import * as db from "./lib/supabase";
import { PRODUCTS as initialProducts, SOLAR_PRODUCTS as initialSolarProducts, CATEGORIES, SOLAR_CATEGORIES, Product, SolarProduct, DEFAULT_CSV_DATA } from "./data/catalog";
import { HitechLogo } from "./components/HitechLogo";
import { GalleryCard, getCategoryFallbackImage } from "./components/GalleryCard";

// Global constant fallback config
const WA_SALES = "2348065210611"; 
const WA_INVENTORY = "2348034832773";
const WA_GM = "2348032175552";
const WA_GEN = "2347032724432";
const STORE = {
  name: "HiTech Emporium",
  legalName: "HiTech Distributors",
  addr: "6 Airport Road, Warri, Delta State, Nigeria",
  phone: "08032175552",
  hours: "Mon–Sat 8am–6pm",
  site: "hitechd.com"
};

// Types for app state
interface CartItem {
  product: Product | SolarProduct;
  quantity: number;
}

interface RepairSubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  productName: string;
  modelSerial: string;
  problem: string;
  method: string;
  ref: string;
  status: "Received" | "Under Review" | "Being Repaired" | "Ready for Collection" | "Collected";
  submittedAt: string;
}

interface GMRequest {
  id: string;
  type: string;
  message: string;
  name: string;
  phone: string;
  preferredTime: string;
  status: "pending" | "resolved";
  timestamp: string;
}

interface FeedbackReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface PickupSlot {
  id: string;
  name: string;
  phone: string;
  items: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled";
  timestamp: string;
}

interface CustomDeal {
  id: string;
  title: string;
  desc: string;
  oldPrice: string;
  newPrice: string;
  badge: string;
}

interface VideoGalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  timestamp: string;
  views?: string;
  duration?: string;
}

const Teleprompter = ({ text }: { text: string }) => {
  return (
    <div className="bg-[#1a2a4a] text-white py-2 border-4 border-[#1a2a4a] mb-6 overflow-hidden flex items-center shadow-[4px_4px_0px_0px_rgba(26,42,74,1)] relative group select-none">
      <span className="flex-shrink-0 z-10 bg-[#1a2a4a] pr-3 pl-4 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
        <span className="text-sm">📢</span> <span className="hidden sm:inline">NOTICE:</span>
      </span>
      <div className="flex-grow overflow-hidden relative">
        <div className="whitespace-nowrap animate-marquee pause-marquee text-xs font-mono">
          {text}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ p, onAdd, onView, index, displayPrice }: { p: Product; onAdd: (p: Product) => void; onView: (p: Product) => void; index: number; displayPrice?: string; key?: any }) => {
  const [imgSrc, setImgSrc] = React.useState<string>("");

  React.useEffect(() => {
    if (p) {
      setImgSrc(p.imgFront || p.imgManual || p.imgSide || p.imgBack || p.imgTop || getCategoryFallbackImage(p.cat || ""));
    }
  }, [p]);

  return (
    <div className="bg-white border-2 border-[#1a2a4a] p-4 flex flex-col gap-3 relative group hover:shadow-[8px_8px_0px_0px_rgba(26,42,74,1)] transition-all">
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-300">
          <span className="opacity-60 text-[8px]">No.</span> {p.displayOrder || index + 1}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(dot => (
            <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot === 1 ? 'bg-amber-500' : 'bg-blue-500'} opacity-70`} />
          ))}
        </div>
      </div>
      
      <div className="w-full h-[160px] bg-slate-50 flex items-center justify-center border border-dashed border-slate-300 rounded shadow-sm overflow-hidden relative cursor-pointer group-hover:bg-slate-100/80 transition-all" onClick={() => onView(p)}>
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt={p.n} 
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm bg-white" 
            referrerPolicy="no-referrer"
            onError={() => {
              setImgSrc("");
            }}
          />
        ) : (
          <div className="text-slate-400 opacity-80 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            {p.cat === "laptops" ? (
              <Laptop className="w-10 h-10 text-slate-400" />
            ) : p.cat === "printers" ? (
              <Printer className="w-10 h-10 text-slate-400" />
            ) : (
              <Box className="w-10 h-10 text-slate-400" />
            )}
            <span className="text-[9px] font-black tracking-wider uppercase text-slate-500 mt-1">No Image Uploaded</span>
            <span className="text-[8px] text-slate-400 font-medium">(Click to Add Photo)</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="px-2 py-1 bg-[#1a2a4a] text-white text-[9px] font-bold uppercase tracking-wider">{p.brand || "HITECH"}</span>
        <span className={`px-2 py-1 border border-[#1a2a4a] text-[9px] font-bold uppercase tracking-wider ${SOLAR_CATEGORIES.some(sc => sc.id === p.cat) ? 'bg-red-100 text-[#dc3545]' : 'bg-slate-200 text-black'}`}>{p.cat}</span>
        <span className={`px-2 py-1 bg-slate-100 border border-slate-300 text-[9px] font-mono tracking-wider truncate max-w-[120px] ${SOLAR_CATEGORIES.some(sc => sc.id === p.cat) ? 'text-[#dc3545]' : 'text-slate-600'}`}>CODE: {p.pn || "—"}</span>
      </div>

      <div className="pt-1 pb-1">
        <h3 className="font-bold text-sm text-[#1a1a2e] leading-tight">{p.n}</h3>
      </div>

      <div className="border-t border-[#1a2a4a] pt-2">
        <p className={`text-[11px] leading-tight line-clamp-2 min-h-[30px] ${SOLAR_CATEGORIES.some(sc => sc.id === p.cat) ? 'text-[#dc3545]' : 'text-slate-800'}`}>{p.desc}</p>
      </div>

      {p.bullets && (
        <div className="border-t border-[#1a2a4a] pt-2">
          <p className={`text-[10px] font-mono line-clamp-2 ${SOLAR_CATEGORIES.some(sc => sc.id === p.cat) ? 'text-[#dc3545]' : 'text-slate-600'}`}>{p.bullets}</p>
        </div>
      )}

      <div className="border-t border-[#1a2a4a] pt-2 flex items-start gap-1">
        <span className="text-xs">⚙️</span>
        <p className={`text-[11px] font-serif italic line-clamp-2 ${SOLAR_CATEGORIES.some(sc => sc.id === p.cat) ? 'text-[#dc3545]' : 'text-slate-800'}`}>{p.sp}</p>
      </div>

      <div className="border-t border-[#1a2a4a] pt-2 flex justify-between items-center">
        <span className="price text-sm font-bold font-mono text-[#1a1a2e]">{p.price !== "CALL" && !p.price.includes("₦") ? "₦" : ""}{displayPrice || p.price}</span>
        {p.assurance && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">⭐ {p.assurance}</span>}
      </div>

      <div className="border-t border-[#1a2a4a] pt-2">
        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">🟢 {p.stock || "In Stock"}</span>
      </div>

      <div className="border-t border-[#1a2a4a] pt-2 bg-[#1a2a4a] p-2 mt-2 -mx-4">
        <a href="#" className="text-[10px] text-white font-bold hover:underline flex items-center gap-1">👥 See what others think → Visit Website</a>
      </div>

      <div className="border-t border-[#1a2a4a] pt-2 pb-1">
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          📅 Viewed: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
      </div>

      <div className="border-t border-[#1a2a4a] pt-3 flex gap-2">
        {p.price !== "CALL" && (
          <button onClick={(e) => { e.stopPropagation(); onAdd(p); }} className="flex-1 py-2 bg-[#1a2a4a] hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            🛒 ADD TO ORDER
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onView(p); }} className="flex-1 py-2 bg-white hover:bg-slate-100 border border-[#1a2a4a] text-black text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          🔍 VIEW DETAILS
        </button>
      </div>
    </div>
  );
};

const compressImageToBase64 = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Image load error"));
    };
    reader.onerror = (error) => reject(error);
  });
};

const MediaUploadButton = ({ type, label, onUploadSuccess }: { type: "image" | "video", label: string, onUploadSuccess?: (url: string) => void, key?: any }) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("📤 Processing...");

    try {
      if (type === "image") {
        // Step 1: Compress locally to lightweight Base64 instantly
        const compressedBase64 = await compressImageToBase64(file);
        
        // Step 2: Convert to Blob and upload to Supabase Storage
        const blob = await base64ToBlob(compressedBase64);
        const publicUrl = await uploadToSupabaseStorage(blob, file.name);

        setStatus("✅ Image uploaded to Supabase Storage!");
        if (onUploadSuccess) onUploadSuccess(publicUrl);
      } else {
        // Video Uploads: upload directly to Supabase Storage
        const publicUrl = await uploadToSupabaseStorage(file, file.name);
        setStatus("✅ Video uploaded successfully!");
        if (onUploadSuccess) onUploadSuccess(publicUrl);
      }
    } catch (err: any) {
      console.error("General upload error:", err);
      setStatus("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-slate-700 transition-colors text-center w-full min-h-[32px]">
        {uploading ? <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" /> : <Upload className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate">{uploading ? "📤 Processing..." : label}</span>
        <input
          type="file"
          accept={type === "image" ? "image/jpeg,image/png,image/webp" : "video/*"}
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
          id="file_input"
        />
      </label>
      {status && (
        <p className={`text-[8px] font-mono mt-0.5 text-center px-1 ${status.startsWith("✅") ? "text-emerald-400" : status.startsWith("❌") ? "text-red-400" : "text-amber-400"}`}>
          {status}
        </p>
      )}
    </div>
  );
};

const ProductDetailOverlay = ({ 
  selectedProduct, 
  setSelectedProduct, 
  products, 
  setProducts, 
  solarProducts,
  setSolarProducts,
  getDisplayPrice, 
  addToCart,
  WA_SALES
}: {
  selectedProduct: Product | SolarProduct | null;
  setSelectedProduct: (p: Product | SolarProduct | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  solarProducts?: SolarProduct[];
  setSolarProducts?: React.Dispatch<React.SetStateAction<SolarProduct[]>>;
  getDisplayPrice: (p: Product | SolarProduct) => string;
  addToCart: (p: Product | SolarProduct) => void;
  WA_SALES: string;
}) => {
  const [activeView, setActiveView] = useState<"Manual" | "Front" | "Side" | "Back" | "Top">("Manual");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const isSolarItem = selectedProduct ? (solarProducts && solarProducts.some(item => item.id === selectedProduct.id)) || SOLAR_CATEGORIES.some(sc => sc.id === selectedProduct.cat) : false;

  // Helper for closing & checking unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  };

  // Reset view when product changes
  useEffect(() => {
    if (selectedProduct?.id) {
      setActiveView("Manual");
      setHasUnsavedChanges(false);
      setSaveStatus(null);
    }
  }, [selectedProduct?.id]);

  // Keyboard shortcuts (Ctrl+S / Cmd+S to save/close, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProduct) return;
      
      // Escape key to close
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSaveChanges();
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct, hasUnsavedChanges]);

  if (!selectedProduct) return null;

  const views = ["Manual", "Front", "Side", "Back", "Top"] as const;

  const getImageUrl = (view: typeof activeView) => {
    const p = selectedProduct as Product;
    switch (view) {
      case "Manual": return p.imgManual;
      case "Front": return p.imgFront;
      case "Side": return p.imgSide;
      case "Back": return p.imgBack;
      case "Top": return p.imgTop;
    }
  };

  const handleImageUpdate = async (view: typeof activeView, url: string) => {
    const p = selectedProduct as any;
    let updatedProduct = { ...p };
    
    switch (view) {
      case "Manual": updatedProduct.imgManual = url; break;
      case "Front": updatedProduct.imgFront = url; break;
      case "Side": updatedProduct.imgSide = url; break;
      case "Back": updatedProduct.imgBack = url; break;
      case "Top": updatedProduct.imgTop = url; break;
    }
    
    setSelectedProduct(updatedProduct as any);
    const isSolar = solarProducts && solarProducts.some(item => item.id === updatedProduct.id);
    if (isSolar && setSolarProducts) {
      setSolarProducts(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct as any : item));
    } else {
      setProducts(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct as Product : item));
    }
    setActiveView(view);
    
    // Automatically save to Supabase as requested
    setSaveStatus("Saving image...");
    try {
      const docId = String(updatedProduct.id);
      const mapped = {
        row_number: updatedProduct.displayOrder ? Number(updatedProduct.displayOrder) : undefined,
        brand: updatedProduct.brand,
        product_code: updatedProduct.pn,
        category: updatedProduct.cat,
        description_headline: updatedProduct.n,
        extra_details: updatedProduct.desc,
        description_bullets: updatedProduct.bullets,
        technical_specs: updatedProduct.sp,
        price: updatedProduct.price,
        assurance_layer: updatedProduct.assuranceLayer,
        assurance_text: updatedProduct.assuranceText,
        laggard_layer: updatedProduct.laggardLayer,
        laggard_promo_text: updatedProduct.laggardPromoText,
        main_image_url: updatedProduct.imgManual,
        front_image_url: updatedProduct.imgFront,
        side_image_url: updatedProduct.imgSide,
        back_image_url: updatedProduct.imgBack,
        top_image_url: updatedProduct.imgTop,
        video_url: updatedProduct.imgVideo,
        stock_status: updatedProduct.stock,
        staff_notes: updatedProduct.staffNotes,
        search_keywords: updatedProduct.searchKeywords,
        color_variant: updatedProduct.color,
        needs_verification: updatedProduct.needsVerification === "Yes",
        floor_display: updatedProduct.floorDisplay === "Yes",
        show_in_sale_room: !!updatedProduct.promo,
        show_in_seasonal_promo: !!updatedProduct.newp
      };
      const saved = await db.updateProduct(docId, mapped);
      if (saved && saved.id) {
        const savedId = String(saved.id);
        if (savedId !== updatedProduct.id) {
          const oldId = updatedProduct.id;
          updatedProduct.id = savedId;
          setSelectedProduct(updatedProduct as any);
          if (isSolar && setSolarProducts) {
            setSolarProducts(prev => prev.map(item => item.id === oldId ? updatedProduct as any : item));
          } else {
            setProducts(prev => prev.map(item => item.id === oldId ? updatedProduct as Product : item));
          }
        }
      }
      setSaveStatus("✅ Image saved successfully!");
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      console.error("Supabase auto-save error:", e);
      setSaveStatus("❌ Failed to save image.");
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    setSaveStatus("Saving...");
    try {
      if (!selectedProduct.id) {
        throw new Error("Cannot save: Product ID is missing.");
      }

      const docId = String(selectedProduct.id);
      const prod = selectedProduct as any;
      const mapped = {
        row_number: prod.displayOrder ? Number(prod.displayOrder) : undefined,
        brand: prod.brand,
        product_code: prod.pn,
        category: prod.cat,
        description_headline: prod.n,
        extra_details: prod.desc,
        description_bullets: prod.bullets,
        technical_specs: prod.sp,
        price: prod.price,
        assurance_layer: prod.assuranceLayer,
        assurance_text: prod.assuranceText,
        laggard_layer: prod.laggardLayer,
        laggard_promo_text: prod.laggardPromoText,
        main_image_url: prod.imgManual,
        front_image_url: prod.imgFront,
        side_image_url: prod.imgSide,
        back_image_url: prod.imgBack,
        top_image_url: prod.imgTop,
        video_url: prod.imgVideo,
        stock_status: prod.stock,
        staff_notes: prod.staffNotes,
        search_keywords: prod.searchKeywords,
        color_variant: prod.color,
        needs_verification: prod.needsVerification === "Yes",
        floor_display: prod.floorDisplay === "Yes",
        show_in_sale_room: !!prod.promo,
        show_in_seasonal_promo: !!prod.newp
      };

      const saved = await db.updateProduct(docId, mapped);
      
      const isSolar = solarProducts && solarProducts.some(item => item.id === selectedProduct.id);
      let updatedProduct = { ...prod };
      if (saved && saved.id) {
        updatedProduct.id = String(saved.id);
      }

      if (isSolar && setSolarProducts) {
        setSolarProducts(prev => prev.map(item => item.id === selectedProduct.id ? updatedProduct as any : item));
      } else {
        setProducts(prev => prev.map(item => item.id === selectedProduct.id ? updatedProduct as Product : item));
      }

      setSelectedProduct(updatedProduct);
      setSaveStatus("✅ Changes saved successfully!");
      setHasUnsavedChanges(false);
      
      // Smoothly close after short delay for satisfying confirmation
      setTimeout(() => {
        setSaveStatus(null);
        setSelectedProduct(null);
      }, 1000);
    } catch (e: any) {
      console.error("Supabase save error:", e);
      console.error("Data that failed to save:", selectedProduct);
      setSaveStatus("❌ Failed to save. Please try again.");
    }
  };

  const currentImageUrl = getImageUrl(activeView);

  return (
    <AnimatePresence>
      {selectedProduct && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[1050] bg-[#1a2a4a]/60 backdrop-blur-sm flex justify-center items-end"
          onClick={handleClose}
        >
          <div className="w-full max-w-[430px] bg-[var(--dk2)] border-t border-slate-800 rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
               onClick={(e) => e.stopPropagation()}>
            
            {/* Drag Handle */}
            <div className="h-6 w-full flex items-center justify-center border-b border-slate-900 flex-shrink-0 cursor-pointer"
                 onClick={handleClose}>
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            <div className="p-4 overflow-y-auto flex-grow flex flex-col gap-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700">
                  <span className="opacity-60 text-[8px]">No.</span> {(selectedProduct as any).displayOrder || products.indexOf(selectedProduct as Product) + 1}
                </span>
                <div className="flex gap-1">
                  {views.map((view, idx) => (
                    <div 
                      key={view} 
                      onClick={() => setActiveView(view)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${activeView === view ? 'bg-amber-500' : 'bg-slate-600'} opacity-80`} 
                    />
                  ))}
                </div>
              </div>

              <div className="w-full h-[160px] bg-white border border-slate-200 rounded shadow-sm flex items-center justify-center text-slate-500 overflow-hidden relative">
                {currentImageUrl ? (
                  <img 
                    src={currentImageUrl} 
                    alt={`${selectedProduct.n} ${activeView}`} 
                    className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-400 opacity-80 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                    {selectedProduct.cat === "laptops" ? (
                      <Laptop className="w-10 h-10 text-slate-400" />
                    ) : selectedProduct.cat === "printers" ? (
                      <Printer className="w-10 h-10 text-slate-400" />
                    ) : (
                      <Box className="w-10 h-10 text-slate-400" />
                    )}
                    <span className="text-[9px] font-black tracking-wider uppercase text-slate-500 mt-1">No {activeView} Photo Uploaded</span>
                    <span className="text-[8px] text-slate-400 font-medium">(Upload a photo for the "{activeView}" view below)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1 mt-1">
                {views.map(view => (
                  <MediaUploadButton 
                    key={view}
                    type="image" 
                    label={`Upload ${view}`} 
                    onUploadSuccess={(url) => handleImageUpdate(view, url)}
                  />
                ))}
              </div>

              {/* Save / Cancel Buttons */}
              <div className="flex flex-col gap-2 mt-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                <div className="flex gap-2">
                  <button 
                    onClick={hasUnsavedChanges ? handleSaveChanges : handleClose}
                    disabled={saveStatus === "Saving..." || saveStatus === "Saving image..."}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-colors text-white ${
                      saveStatus === "Saving..." || saveStatus === "Saving image..."
                        ? "bg-slate-700 cursor-wait text-slate-300"
                        : hasUnsavedChanges
                        ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    }`}
                  >
                    {saveStatus === "Saving..." || saveStatus === "Saving image..." ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : hasUnsavedChanges ? (
                      <>
                        💾 SAVE CHANGES
                      </>
                    ) : (
                      <>
                        ✅ DONE & CLOSE
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleClose}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {hasUnsavedChanges ? "❌ DISCARD" : "❌ CLOSE"}
                  </button>
                </div>
                {saveStatus && (
                  <p className={`text-[10px] font-mono text-center animate-pulse ${saveStatus.includes("✅") ? "text-emerald-400 font-bold" : saveStatus.includes("❌") ? "text-red-400 font-bold" : "text-amber-400"}`}>
                    {saveStatus}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <input 
                    type="text" 
                    value={selectedProduct.n || ""} 
                    onChange={(e) => {
                      setSelectedProduct({ ...selectedProduct, n: e.target.value } as any);
                      setHasUnsavedChanges(true);
                      setSaveStatus(null);
                    }}
                    placeholder="Product Name"
                    className="font-black text-base text-[var(--cr)] bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full transition-colors pb-1" 
                  />
                  <input 
                    type="text"
                    value={selectedProduct.price || ""}
                    onChange={(e) => {
                      setSelectedProduct({ ...selectedProduct, price: e.target.value } as any);
                      setHasUnsavedChanges(true);
                      setSaveStatus(null);
                    }}
                    placeholder="Price"
                    className="text-xs font-mono font-bold text-[#1a1a2e] flex-shrink-0 bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-24 text-right transition-colors pb-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">CODE:</span>
                  <input 
                    type="text"
                    value={(selectedProduct as any).pn || ""}
                    onChange={(e) => {
                      setSelectedProduct({ ...selectedProduct, pn: e.target.value } as any);
                      setHasUnsavedChanges(true);
                      setSaveStatus(null);
                    }}
                    placeholder="Product Code"
                    className={`text-[10px] font-mono bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full transition-colors ${isSolarItem ? 'text-[#dc3545]' : 'text-slate-500'}`}
                  />
                </div>
                <input 
                  type="text"
                  value={selectedProduct.sp || ""}
                  onChange={(e) => {
                    setSelectedProduct({ ...selectedProduct, sp: e.target.value } as any);
                    setHasUnsavedChanges(true);
                    setSaveStatus(null);
                  }}
                  placeholder="Specs"
                  className={`text-xs leading-relaxed font-mono bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full transition-colors mt-1 pb-1 ${isSolarItem ? 'text-[#dc3545]' : 'text-[var(--mu)]'}`}
                />
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <textarea 
                  value={selectedProduct.desc || ""}
                  onChange={(e) => {
                    setSelectedProduct({ ...selectedProduct, desc: e.target.value } as any);
                    setHasUnsavedChanges(true);
                    setSaveStatus(null);
                  }}
                  placeholder="Description..."
                  className={`text-xs leading-relaxed bg-transparent border border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full resize-none min-h-[60px] transition-colors p-1 rounded ${isSolarItem ? 'text-[#dc3545]' : 'text-slate-300'}`}
                />
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  📅 Viewed: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>

              <div className="flex gap-2.5 pt-4 mt-auto">
                <button
                  onClick={() => {
                    const text = `Hello HiTech, I would like to make an enquiry about: ${selectedProduct.n} (Price: ${getDisplayPrice(selectedProduct)})`;
                    window.open(`https://wa.me/${WA_SALES}?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#1da851] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                {selectedProduct.price !== "CALL" && (
                  <button
                    onClick={() => { addToCart(selectedProduct as Product); setSelectedProduct(null); }}
                    className="flex-1 py-3 bg-[var(--bl)] hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> Add to Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MOCKUP_GALLERY_IMAGES = [
  {
    category: "Laptops",
    title: "HP Laptop Models",
    description: "HP 250, HP 240, HP Pavilion, HP Envy (front, side, back, top views)",
    img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Desktops",
    title: "HP Desktops",
    description: "HP All-in-One, HP ProDesk (front, side, back views)",
    img: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Printers",
    title: "HP Printers",
    description: "HP LaserJet, HP Smart Tank, HP DeskJet (front, side views; size reference)",
    img: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Monitors",
    title: "HP Monitors",
    description: "HP monitors (front and side views)",
    img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Solar",
    title: "Solar Solutions",
    description: "Solar panels, inverters, batteries, charge controllers (full product view, installation reference)",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "UPS/Inverters",
    title: "Power Backup",
    description: "Bluegate, Evergood (front view, size reference)",
    img: "https://images.unsplash.com/photo-1585246231149-bc91a43a0889?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "CCTV",
    title: "Surveillance",
    description: "Cameras, DVRs, cables (front and side views)",
    img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Cameras",
    title: "Digital Cameras",
    description: "Digital cameras, webcams (front, side, and lens views)",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Accessories",
    title: "Tech Accessories",
    description: "Flash drives, cables, adapters (close-up, size reference)",
    img: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Inks/Toners",
    title: "Inks & Toners",
    description: "HP ink cartridges, toners (packaging, label view)",
    img: "https://images.unsplash.com/photo-1587614295999-6c1c13675117?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Phones",
    title: "Mobile Phones",
    description: "Various mobile phones (front and side views)",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Tablets",
    title: "Tablets",
    description: "Various tablets (front and side views)",
    img: "https://images.unsplash.com/photo-1544228428-c9fc2c4b8b6a?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Networking",
    title: "Networking Gear",
    description: "Routers, switches, cables, access points (front and port views)",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Repairs/Services",
    title: "Professional Repairs",
    description: "People servicing computers, cameras, printers (professional repair/workshop images)",
    img: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
  }
];

export default function App() {
  // App navigation state
  const [inStore, setInStore] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [currentRoom, _setCurrentRoom] = useState("showroom");
  const [roomHistory, setRoomHistory] = useState<string[]>([]);

  const setCurrentRoom = (newRoom: string) => {
    if (newRoom !== currentRoom) {
      setRoomHistory(prev => [...prev, currentRoom]);
      _setCurrentRoom(newRoom);
    }
  };

  const handleBack = () => {
    if (roomHistory.length > 0) {
      const prevRoom = roomHistory[roomHistory.length - 1];
      setRoomHistory(prev => prev.slice(0, -1));
      _setCurrentRoom(prevRoom);
    } else {
      setInStore(false);
    }
  };

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | SolarProduct | null>(null);
  
  // Compare Room State
  const [compareProduct1, setCompareProduct1] = useState<Product | SolarProduct | null>(null);
  const [compareProduct2, setCompareProduct2] = useState<Product | SolarProduct | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareSelectMode, setCompareSelectMode] = useState<1 | 2 | null>(null);
  const [compareSearch1, setCompareSearch1] = useState("");
  const [compareSearch2, setCompareSearch2] = useState("");
  const defaultPresets = {
    hitech_preset_1: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    hitech_preset_2: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80",
    hitech_preset_3: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80"
  };

  const [presets, setPresets] = useState<{ [key: string]: string }>(() => {
    const local = localStorage.getItem("ht_storefront_presets");
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return defaultPresets;
  });

  const [storefrontImage, setStorefrontImage] = useState<string>(() => {
    const local = localStorage.getItem("ht_storefront_image");
    if (local) {
      return local;
    }
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
  });

  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadStatus, setLogoUploadStatus] = useState("");

  const handleLogoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadStatus("📤 Processing logo...");

    try {
      const compressedBase64 = await compressImageToBase64(file, 512, 512, 0.9);
      const blob = await base64ToBlob(compressedBase64);
      const publicUrl = await uploadToSupabaseStorage(blob, file.name);

      await db.saveCompanyLogo(publicUrl);
      window.dispatchEvent(new Event("ht_logo_updated"));
      setLogoUploadStatus("✅ Logo saved!");
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setLogoUploadStatus("❌ Failed: " + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handlePresetUpload = (presetId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`📤 Processing image for ${presetId}...`);

    try {
      const compressedBase64 = await compressImageToBase64(file);
      const blob = await base64ToBlob(compressedBase64);
      const publicUrl = await uploadToSupabaseStorage(blob, file.name);

      await db.saveStorefrontPreset(presetId, publicUrl);
      
      const newPresets = { ...presets, [presetId]: publicUrl };
      setPresets(newPresets);
      localStorage.setItem("ht_storefront_presets", JSON.stringify(newPresets));

      // If this preset was the active banner, update the active banner too
      if (storefrontImage === presets[presetId]) {
        setStorefrontImage(publicUrl);
        localStorage.setItem("ht_storefront_image", publicUrl);
        await db.saveStorefrontBanner(publicUrl);
      }

      setUploadStatus(`✅ Saved! Replaced image for ${presetId}.`);
    } catch (err: any) {
      console.error("Preset upload failed:", err);
      setUploadStatus("❌ Failed to process preset image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const [productOverrides, setProductOverrides] = useState<Record<string, Partial<Product>>>({});

  // Dynamic Product lists with Preset application
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [solarProducts, setSolarProducts] = useState<SolarProduct[]>(initialSolarProducts);
  type PresetType = "DEFAULT" | "PROMO HIGH" | "SEASONAL DEALS" | "WORKBOOK DISPLAY" | "LAST IMPORTED SHEET";
  const [roomPresets, setRoomPresets] = useState<Record<string, PresetType>>(() => {
    try {
      const saved = localStorage.getItem("ht_room_presets");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { showroom: "DEFAULT", display: "DEFAULT", livesheet: "DEFAULT", deals: "DEFAULT", gallery: "DEFAULT", manager: "DEFAULT" };
  });
  const currentPreset = roomPresets[currentRoom] || "DEFAULT";
  const setCurrentPreset = async (preset: PresetType) => {
    const next = { ...roomPresets, [currentRoom]: preset };
    setRoomPresets(next);
    localStorage.setItem("ht_room_presets", JSON.stringify(next));
  };
  
  const [customPresets, setCustomPresets] = useState<Record<string, string[]>>({});
  const [displayFloorSelection, setDisplayFloorSelection] = useState<string[]>(() => {
    const saved = localStorage.getItem("ht_display_floor_config");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return Array.from({ length: 25 }, (_, i) => String(131 + i));
  });
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editingNumbers, setEditingNumbers] = useState<string[]>([]);
  const [newNumbersInput, setNewNumbersInput] = useState<string>("");

  useEffect(() => {
    if (editingPreset) {
      if (customPresets[editingPreset]) {
        setEditingNumbers(customPresets[editingPreset]);
      } else {
        let defaultList: string[] = [];
        if (editingPreset === "DEFAULT") {
          defaultList = DEFAULT_CSV_DATA.map(p => String(p.displayOrder));
        } else {
          let list = products;
          if (editingPreset === "PROMO HIGH") list = list.filter(p => p.promo);
          else if (editingPreset === "SEASONAL DEALS") list = list.filter(p => p.newp || p.cat === "laptops");
          else if (editingPreset === "LAST IMPORTED SHEET") list = list.filter(p => p.id && (p.id.startsWith("imp-") || p.id.startsWith("csv-")));
          else if (editingPreset === "WORKBOOK DISPLAY") list = list.filter(p => p.id && !(p.id.startsWith("imp-") || p.id.startsWith("csv-")));
          defaultList = list.map(p => {
            if (p.displayOrder) return String(p.displayOrder);
            return String(products.indexOf(p) + 1);
          });
        }
        setEditingNumbers(defaultList);
      }
    }
  }, [editingPreset, customPresets, products]);

  const handleAddNumbers = () => {
    if (!newNumbersInput.trim()) return;
    const parts = newNumbersInput.split(",").map(s => s.trim());
    let toAdd: string[] = [];
    parts.forEach(part => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            toAdd.push(String(i));
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num)) toAdd.push(String(num));
      }
    });
    
    if (toAdd.length > 0) {
      // Avoid duplicates
      setEditingNumbers(prev => Array.from(new Set([...prev, ...toAdd])));
      setNewNumbersInput("");
    }
  };
  
  const [galleryImages, setGalleryImages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("ht_gallery_images");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "defaults-1", title: "HP Printers Section", url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80", caption: "All-in-One InkTank and heavy LaserJet workspace scanners in stock." },
      { id: "defaults-2", title: "Solar Inverter Bank", url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=80", caption: "Selection of Cworth hybrids and Felicity smart battery storage units." },
      { id: "defaults-3", title: "Desktop Configuration", url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&q=80", caption: "HP EliteDesk and All-in-One workstations configured on display." }
    ];
  });

  const [galleryVideos, setGalleryVideos] = useState<VideoGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem("ht_gallery_videos");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "v1", title: "How to Use the Hublet", description: "Tutorial on navigating the app", url: "", category: "Tutorial", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), views: "1.2k" },
      { id: "v2", title: "Manager's Address", description: "Message from the General Manager", url: "", category: "Manager's Address", timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), views: "342" },
      { id: "v3", title: "How to Use a Printer", description: "Printer tutorial", url: "", category: "Tutorial", timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), views: "890" },
      { id: "v4", title: "How to Use Solar", description: "Solar installation and usage", url: "", category: "Installation", timestamp: new Date(Date.now() - 86400000 * 15).toISOString(), views: "156" }
    ];
  });
  
  // Storage falls back to localStorage if Firestore hasn't provisioned yet
  const [repairs, setRepairs] = useState<RepairSubmission[]>([]);
  const [gmRequests, setGmRequests] = useState<GMRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackReview[]>([
    { id: "f1", name: "Oghenetega W.", rating: 5, comment: "Excellent service. Got my HP EliteDesk desktop here and the speed is incredible. High quality!", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "f2", name: "Chinedu O.", rating: 4, comment: "Helpful assistant and clean showroom. The choice inverter works great for my office.", timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
  ]);
  const [pickups, setPickups] = useState<PickupSlot[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [schoolApplications, setSchoolApplications] = useState<any[]>([]);
  const [staffActionStatus, setStaffActionStatus] = useState<string | null>(null);
  const [customDeals, setCustomDeals] = useState<CustomDeal[]>([
    { id: "d1", title: "HP Laser MFP 107w", desc: "Laser, Wireless, Compact, Fast print", oldPrice: "₦330,000", newPrice: "₦250,000", badge: "SPECIAL PROMO" },
    { id: "d2", title: "HP Pavilion 13 Core i3", desc: "Core i3-1115G4, 8GB, 256GB SSD, Silver", oldPrice: "₦780,000", newPrice: "₦650,000", badge: "PROMO LAPTOP" },
    { id: "d3", title: "HP 250 Core i7", desc: "Intel Core i7, 1TB HDD, 8GB RAM, 15.6”", oldPrice: "₦920,000", newPrice: "₦750,000", badge: "PROMO LAPTOP" },
    { id: "d4", title: "HP 15 Core i5", desc: "Core i5-10210U, 12GB, 1TB, Win10", oldPrice: "₦820,000", newPrice: "₦685,000", badge: "PROMO LAPTOP" },
    { id: "d5", title: "460W Solar Panel (Used)", desc: "460W Monocrystalline, Tested", oldPrice: "₦95,000", newPrice: "₦50,000", badge: "BUDGET SOLAR" }
  ]);
  const [managerAvailable, setManagerAvailable] = useState(true);
  const [bankInfo, setBankInfo] = useState("GTBank, Account: 9006163631, Account Name: HiTech Distributors");

  // Receipt Form State
  const [receiptNumber, setReceiptNumber] = useState("");
  const [rcpCustomerName, setRcpCustomerName] = useState("");
  const [rcpCustomerPhone, setRcpCustomerPhone] = useState("");
  const [rcpCustomerEmail, setRcpCustomerEmail] = useState("");
  const [rcpInvoiceNum, setRcpInvoiceNum] = useState("");
  const [rcpAmount, setRcpAmount] = useState("");
  const [rcpMethod, setRcpMethod] = useState("Bank Transfer");
  const [rcpDate, setRcpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rcpRef, setRcpRef] = useState("");
  const [rcpPaidFor, setRcpPaidFor] = useState("");
  const [rcpBalance, setRcpBalance] = useState("0");
  const [rcpIssuedBy, setRcpIssuedBy] = useState("Lucy");
  const [showReceipt, setShowReceipt] = useState(false);

  // Cart/Invoicing state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<"draft" | "generated" | "paid">("draft");
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);

  // Interactive Sizing state
  const [sizingAppliances, setSizingAppliances] = useState<{ id: string; name: string; watts: number; hours: number; count: number }[]>([
    { id: "1", name: "LED Bulbs", watts: 15, hours: 8, count: 5 },
    { id: "2", name: "Standing Fan", watts: 75, hours: 6, count: 2 },
    { id: "3", name: "Television", watts: 120, hours: 5, count: 1 }
  ]);
  const [sizingRecommendation, setSizingRecommendation] = useState<any | null>(null);
  const [sizingLoading, setSizingLoading] = useState(false);

  // Diagnostics Desk state
  const [repairCustName, setRepairCustName] = useState("");
  const [repairCustPhone, setRepairCustPhone] = useState("");
  const [repairCustEmail, setRepairCustEmail] = useState("");
  const [repairProductName, setRepairProductName] = useState("");
  const [repairModelSerial, setRepairModelSerial] = useState("");
  const [repairProblem, setRepairProblem] = useState("");
  const [repairMethod, setRepairMethod] = useState("In-Store");
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [repairSuccess, setRepairSuccess] = useState<string | null>(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  // AI Support / Info Booth chat state
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Welcome to HiTech Emporium! I am your AI Support Assistant. Ask me anything about our laptops, printers, custom solar configurations, repairs, or current promotional pricing!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // GM Contact form
  const [gmMsgType, setGmMsgType] = useState("Business Partnership/Distributorship");
  const [gmMsgText, setGmMsgText] = useState("");
  const [gmCustName, setGmCustName] = useState("");
  const [gmCustPhone, setGmCustPhone] = useState("");
  const [gmPrefTime, setGmPrefTime] = useState("");
  const [gmMsgSent, setGmMsgSent] = useState(false);

  // Feedback form
  const [feedRating, setFeedRating] = useState(5);
  const [feedName, setFeedName] = useState("");
  const [feedComment, setFeedComment] = useState("");

  // Pickup scheduler form
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState("09:00 AM - 11:00 AM");
  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupItems, setPickupItems] = useState("");
  const [pickupBooked, setPickupBooked] = useState(false);

  // Escalation request state
  const [escName, setEscName] = useState("");
  const [escPhone, setEscPhone] = useState("");
  const [escEmail, setEscEmail] = useState("");
  const [escRef, setEscRef] = useState("");
  const [escDesc, setEscDesc] = useState("");
  const [escUrgency, setEscUrgency] = useState("Medium");
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escSuccess, setEscSuccess] = useState<string | null>(null);
  const [submittingEsc, setSubmittingEsc] = useState(false);

  // Shadow School application form state
  const [schName, setSchName] = useState("");
  const [schPhone, setSchPhone] = useState("");
  const [schEmail, setSchEmail] = useState("");
  const [schAge, setSchAge] = useState("");
  const [schProgram, setSchProgram] = useState("Computer Repairs");
  const [schReason, setSchReason] = useState("");
  const [submittingSch, setSubmittingSch] = useState(false);
  const [schSuccess, setSchSuccess] = useState<string | null>(null);

  // Staff Room state
  const [staffPIN, setStaffPIN] = useState("");
  const [staffIsLoggedIn, setStaffIsLoggedIn] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvStatus, setCsvStatus] = useState("");
  const [sheetSearch, setSheetSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Vercel Blob File Upload upload test state (Phase 1)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Video Gallery states
  const [playingVideo, setPlayingVideo] = useState<VideoGalleryItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoGalleryItem | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoSearch, setVideoSearch] = useState("");

  // Initialize Supabase data layer and real-time subscription
  useEffect(() => {
    const loadData = async () => {
      try {
        // Step 1: Seed default products if database is empty on boot
        await db.seedProductsIfEmpty(initialProducts, initialSolarProducts, DEFAULT_CSV_DATA);

        // Step 2: Fetch products and split into catalog states
        const supabaseProducts = await db.fetchProducts();
        if (supabaseProducts && supabaseProducts.length > 0) {
          const mapped = supabaseProducts.map((p: any) => ({
            id: String(p.id),
            displayOrder: String(p.row_number),
            brand: p.brand || "HITECH",
            pn: p.product_code || "",
            cat: p.category || "laptops",
            n: p.description_headline || "Imported Product",
            desc: p.extra_details || p.description_bullets || "",
            bullets: p.description_bullets || "",
            sp: p.technical_specs || "",
            price: p.price || "CALL",
            assuranceLayer: p.assurance_layer ? "Yes" : "No",
            assuranceText: p.assurance_text || "",
            laggardLayer: p.laggard_layer ? "Yes" : "No",
            laggardPromoText: p.laggard_promo_text || "",
            imgManual: p.main_image_url || "",
            imgFront: p.front_image_url || "",
            imgSide: p.side_image_url || "",
            imgBack: p.back_image_url || "",
            imgTop: p.top_image_url || "",
            imgVideo: p.video_url || "",
            stock: p.stock_status || "In Stock",
            staffNotes: p.staff_notes || "",
            searchKeywords: p.search_keywords || "",
            color: p.color_variant || "",
            needsVerification: p.needs_verification ? "Yes" : "No",
            floorDisplay: p.floor_display ? "Yes" : "No",
            promo: p.show_in_sale_room || false,
            newp: p.show_in_seasonal_promo || false
          }));

          const laptopPrinters = mapped.filter((p: any) => ["laptops", "printers", "desktops"].includes(p.cat));
          const solars = mapped.filter((p: any) => !["laptops", "printers", "desktops"].includes(p.cat));
          
          setProducts(laptopPrinters);
          if (solars.length > 0) {
            setSolarProducts(solars.map(s => ({
              id: s.id,
              cat: s.cat.charAt(0).toUpperCase() + s.cat.slice(1),
              n: s.n,
              brand: s.brand,
              sp: s.sp,
              price: s.price,
              desc: s.desc,
              displayOrder: s.displayOrder
            })));
          }
        }

        // Step 3: Fetch Invoices (Orders)
        const fetchedInvoices = await db.fetchInvoices();
        const mappedOrders = fetchedInvoices.map((inv: any) => ({
          id: inv.invoice_number,
          db_id: inv.id,
          customerName: inv.customer_name,
          phone: inv.customer_contact,
          email: "",
          total: inv.total,
          status: inv.status,
          timestamp: inv.created_at,
          items: JSON.stringify((inv.invoice_items || []).map((it: any) => ({
            id: String(it.product_id),
            name: it.custom_description,
            quantity: it.quantity,
            price: String(it.price)
          })))
        }));
        setOrders(mappedOrders);

        // Step 4: Fetch Support Tickets (repairs + gm escalations)
        const tickets = await db.fetchSupportTickets();
        
        // Filter repairs
        const mappedRepairs = tickets.filter((t: any) => t.ticket_type === "repair").map((t: any) => {
          let refVal = String(t.id);
          let modelSerialVal = "";
          let methodVal = "In-Store";
          try {
            const meta = JSON.parse(t.staff_notes || "");
            if (meta.ref) refVal = meta.ref;
            if (meta.modelSerial) modelSerialVal = meta.modelSerial;
            if (meta.method) methodVal = meta.method;
          } catch (e) {
            if (t.product_reference && t.product_reference.includes("|")) {
              const parts = t.product_reference.split("|");
              modelSerialVal = parts[1]?.trim() || "";
            }
          }
          return {
            id: String(t.id),
            name: t.customer_name,
            phone: t.customer_contact?.split("|")[0]?.trim() || t.customer_contact,
            email: t.customer_contact?.split("|")[1]?.trim() || "",
            productName: t.product_reference?.split("|")[0]?.trim() || t.product_reference,
            modelSerial: modelSerialVal,
            problem: t.issue_description?.split("|")[0]?.trim() || t.issue_description,
            method: methodVal,
            ref: refVal,
            status: t.status,
            submittedAt: t.created_at,
            staff_notes: t.staff_notes
          };
        });
        setRepairs(mappedRepairs);

        // Filter gm requests & escalations
        const mappedRequests = tickets.filter((t: any) => t.ticket_type === "gm_escalation").map((t: any) => {
          let prefTimeVal = "Anytime";
          try {
            const meta = JSON.parse(t.staff_notes || "");
            if (meta.preferredTime) prefTimeVal = meta.preferredTime;
          } catch (e) {}
          return {
            id: String(t.id),
            type: t.issue_description?.split(":")[0]?.trim() || "General",
            message: t.issue_description?.split(":").slice(1).join(":")?.trim() || t.issue_description,
            name: t.customer_name,
            phone: t.customer_contact,
            preferredTime: prefTimeVal,
            status: t.status,
            timestamp: t.created_at
          };
        });
        setGmRequests(mappedRequests);

        // Step 5: Fetch Pickup Scheduler
        const slots = await db.fetchPickupSlots();
        const mappedSlots = slots.map((s: any) => ({
          id: String(s.id),
          name: s.customer_name,
          phone: s.customer_contact,
          items: s.order_reference,
          date: s.pickup_date,
          timeSlot: s.pickup_time,
          status: s.status,
          timestamp: s.created_at
        }));
        setPickups(mappedSlots);

        // Step 6: Fetch Client Feedback
        const reviews = await db.fetchFeedback();
        const mappedFeedback = reviews.map((r: any) => ({
          id: String(r.id),
          name: r.customer_name,
          rating: r.rating,
          comment: r.comment,
          timestamp: r.created_at
        }));
        setFeedbacks(mappedFeedback);

        // Step 7: Fetch client channels
        try {
          const channels = await db.fetchClientChannels();
          if (channels && channels.whatsapp) {
            localStorage.setItem("ht_whatsapp_channel", channels.whatsapp);
          }
        } catch (e) {}

        // Step 8: Fetch Storefront Banner & Presets
        try {
          const banner = await db.fetchStorefrontBanner();
          if (banner) {
            setStorefrontImage(banner);
            localStorage.setItem("ht_storefront_image", banner);
          }

          const fetchedPresets = await db.fetchStorefrontPresets();
          if (fetchedPresets && fetchedPresets.length > 0) {
            const presetMap = { ...defaultPresets };
            for (const p of fetchedPresets) {
              if (p.client_id && p.website) {
                presetMap[p.client_id] = p.website;
              }
            }
            setPresets(presetMap);
            localStorage.setItem("ht_storefront_presets", JSON.stringify(presetMap));
          }
        } catch (e) {}

      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    };

    loadData();

    // Set up postgres changes realtime channel
    const channel = supabase
      .channel("postgres-changes-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          console.log("Postgres database change detected! Re-syncing states...");
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync to local storage on adjustments (for robust offline fallback)
  const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    localStorage.setItem("ht_display_floor_config", JSON.stringify(displayFloorSelection));
  }, [displayFloorSelection]);

  const displayedProducts = React.useMemo(() => {
    let list: Product[] = [];
    
    // Build a unified map of all database-fetched products by displayOrder (string)
    const productsMap = new Map<string, Product>();
    
    // 1. Add laptops/printers/desktops
    products.forEach((p, idx) => {
       const numStr = p.displayOrder ? String(p.displayOrder) : String(idx + 1);
       productsMap.set(numStr, p);
    });
    
    // 2. Add solar products mapped to Product format
    solarProducts.forEach((s) => {
       if (s.displayOrder) {
         const numStr = String(s.displayOrder);
         productsMap.set(numStr, {
           id: s.id,
           pn: "",
           cat: s.cat.toLowerCase(),
           n: s.n,
           brand: s.brand,
           sp: s.sp,
           price: s.price,
           desc: s.desc,
           displayOrder: s.displayOrder
         } as any);
       }
    });

    // Helper helper to get a product from the database map or fallback to local static
    const getProductWithDbResolve = (p: any, i: number): Product => {
      const numStr = String(p.displayOrder);
      if (productsMap.has(numStr)) {
        return productsMap.get(numStr)!;
      }
      return {
        id: `def-${i}`,
        pn: p.productCode || "—",
        cat: p.category.toLowerCase().includes("laptop") ? "laptops" : p.category.toLowerCase().includes("battery") ? "tubular battery" : p.category.toLowerCase().includes("inverter") ? "inverters" : "laptops",
        n: `${p.brand} ${p.category}`.trim(),
        sp: p.specs,
        price: p.price || "CALL",
        desc: p.description || "Default Description",
        bullets: (p as any).bullets,
        stock: (p as any).stockStatus,
        displayOrder: p.displayOrder,
      } as any;
    };

    // For Display Floor, we ignore `currentPreset` and use `displayFloorSelection`
    if (currentRoom === "display") {
      // populate fallbacks for productsMap if needed
      DEFAULT_CSV_DATA.forEach((p, i) => {
         const numStr = String(p.displayOrder);
         if (!productsMap.has(numStr)) {
            productsMap.set(numStr, getProductWithDbResolve(p, i));
         }
      });

      let targetNumbers = new Set<string>();
      displayFloorSelection.forEach(r => targetNumbers.add(r));

      list = Array.from(targetNumbers).map(numStr => productsMap.get(numStr)).filter(Boolean) as Product[];
      
      // Apply sorting by displayOrder to maintain sequence
      list.sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
    } else {
      if (customPresets[currentPreset]) {
        const targetNumbers = customPresets[currentPreset];
        
        // populate fallbacks for productsMap if needed
        DEFAULT_CSV_DATA.forEach((p, i) => {
           const numStr = String(p.displayOrder);
           if (!productsMap.has(numStr)) {
              productsMap.set(numStr, getProductWithDbResolve(p, i));
           }
        });
        
        list = targetNumbers.map(numStr => productsMap.get(numStr)).filter(Boolean) as Product[];
      } else {
        list = products;
        if (currentPreset === "DEFAULT") {
          list = DEFAULT_CSV_DATA.map((p, i) => getProductWithDbResolve(p, i));
        } else if (currentPreset === "PROMO HIGH") list = list.filter(p => p.promo);
        else if (currentPreset === "SEASONAL DEALS") list = list.filter(p => p.newp || p.cat === "laptops");
        else if (currentPreset === "LAST IMPORTED SHEET") list = list.filter(p => p.id && (p.id.startsWith("imp-") || p.id.startsWith("csv-")));
        else if (currentPreset === "WORKBOOK DISPLAY") list = list.filter(p => p.id && !(p.id.startsWith("imp-") || p.id.startsWith("csv-")));
      }
    }

    // Fail-safe: If the list is empty (e.g. newly loaded app or empty custom selection), load the default 25 products automatically
    if (list.length === 0) {
      list = DEFAULT_CSV_DATA.map((p, i) => getProductWithDbResolve(p, i));
    }

    // Apply Firestore overrides
    list = list.map(item => {
      if (productOverrides[item.id]) {
        return { ...item, ...productOverrides[item.id] } as Product;
      }
      return item;
    });

    return list;
  }, [products, currentPreset, productOverrides, customPresets, currentRoom, displayFloorSelection]);


  const displayedSolarProducts = React.useMemo(() => {
    let list = solarProducts;
    // Apply Firestore overrides
    list = list.map(item => {
      if (productOverrides[item.id]) {
        return { ...item, ...productOverrides[item.id] } as SolarProduct;
      }
      return item;
    });
    return list;
  }, [solarProducts, productOverrides]);

  // Preset Price Calculator
  const getDisplayPrice = (item: Product | SolarProduct) => {
    if (item.price === "CALL") return "CALL";
    const numericValue = parseInt(item.price.replace(/[^\d]/g, ""), 10);
    if (isNaN(numericValue)) return item.price;

    let adjustedValue = numericValue;
    if (currentPreset === "PROMO HIGH") {
      if (item.cat === "laptops" || item.cat === "printers") {
        adjustedValue = Math.round(numericValue * 0.85); // 15% off
      } else {
        adjustedValue = Math.round(numericValue * 0.95); // 5% off
      }
    } else if (currentPreset === "SEASONAL DEALS") {
      const isSolar = SOLAR_CATEGORIES.some(sc => sc.id === item.cat);
      if (isSolar) {
        adjustedValue = Math.round(numericValue * 0.85); // 15% off solar
      } else {
        adjustedValue = Math.round(numericValue * 0.90); // 10% off other
      }
    }

    return "₦" + adjustedValue.toLocaleString();
  };

  // Phase 1: Test file upload to API (Vercel Blob / local fallback)
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file first.");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadUrl(null);

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setUploadUrl(data.url);
          // Save as receipt if in invoice mode
          if (invoiceStatus === "generated") {
            setPaymentReceipt(data.url);
          }
        } else {
          setUploadError(data.error || "File upload failed.");
        }
      } else {
        const text = await response.text();
        setUploadError(`Upload failed: ${response.status} ${response.statusText} - ${text.slice(0, 30)}`);
      }
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during upload.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Add to shopping cart
  const addToCart = (product: Product | SolarProduct) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => {
      const priceStr = getDisplayPrice(item.product);
      if (priceStr === "CALL") return sum;
      const num = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
      return sum + (num * item.quantity);
    }, 0);
  };

  // Generate Invoice (FATAP-CT Style)
  const handleGenerateInvoice = async () => {
    if (!customerName || !customerPhone || cart.length === 0) {
      alert("Please enter your name and phone, and ensure the cart is not empty.");
      return;
    }

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const newInvoiceId = `INV-${dateStr}-[${seq}]`;
    setInvoiceId(newInvoiceId);
    
    const totalAmount = calculateCartTotal();
    
    let cartItemsText = "";
    cart.map(item => {
      const priceStr = getDisplayPrice(item.product);
      let priceNum = 0;
      if (priceStr !== "CALL") {
        priceNum = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
      }
      cartItemsText += `• ${item.product.n} (${item.quantity}) - ₦${(priceNum * item.quantity).toLocaleString()}\n`;
    });

    const orderRecord = {
      id: newInvoiceId,
      db_id: undefined as any,
      customerName,
      phone: customerPhone,
      email: customerEmail,
      items: JSON.stringify(cart.map(item => ({ id: item.product.id, name: item.product.n, quantity: item.quantity, price: getDisplayPrice(item.product) }))),
      total: totalAmount,
      paid: false,
      timestamp: new Date().toISOString(),
      status: "Pending Payment" as any,
    };

    const invoiceRecord = {
      invoice_number: newInvoiceId,
      customer_name: customerName,
      customer_contact: customerPhone + (customerEmail ? ` | ${customerEmail}` : ""),
      discount: 0,
      total: totalAmount,
      status: "Pending Payment"
    };

    const invoiceItems = cart.map(item => {
      const priceStr = getDisplayPrice(item.product);
      let priceNum = 0;
      if (priceStr !== "CALL") {
        priceNum = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
      }
      const prodIdNum = isNaN(Number(item.product.id)) ? 0 : Number(item.product.id);
      return {
        product_id: prodIdNum,
        custom_description: item.product.n,
        price: priceNum,
        quantity: item.quantity
      };
    });

    try {
      const inserted = await db.insertInvoice(invoiceRecord, invoiceItems);
      orderRecord.db_id = inserted.id;
    } catch (e) {
      console.error("Supabase save failed, falling back to local list:", e);
      const localOrders = JSON.parse(localStorage.getItem("ht_orders") || "[]");
      localStorage.setItem("ht_orders", JSON.stringify([orderRecord, ...localOrders]));
    }

    const waText = `📋 New Invoice #${newInvoiceId} from ${customerName}
Total: ₦${totalAmount.toLocaleString()}

Customer: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || "N/A"}

Items:
${cartItemsText}
Total: ₦${totalAmount.toLocaleString()}

📎 View Full Invoice:
https://hitechdistributors.com/invoice/${newInvoiceId}

Please confirm receipt of this invoice.`;

    // Launch WhatsApp to Lucy
    const waLink = `https://wa.me/2349166241953?text=${encodeURIComponent(waText)}`;
    window.open(waLink, "_blank");
    
    // Launch Email
    window.location.href = `mailto:hitechdistributors@gmail.com,hitechd@hitechd.com?subject=New Invoice ${newInvoiceId}&body=${encodeURIComponent(waText)}`;

    setInvoiceStatus("generated");
  };

  const submitRepairDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairCustName || !repairCustPhone || !repairProductName || !repairModelSerial || !repairProblem) {
      alert("Please fill in all required repair details.");
      return;
    }

    setSubmittingRepair(true);

    // Generate unique daily sequential ticket ID (e.g. RPR-2026-06-28-001)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const todayPrefix = `RPR-${dateStr}`;

    const todayCount = repairs.filter(r => r.ref && r.ref.startsWith(todayPrefix)).length;
    const seq = String(todayCount + 1).padStart(3, '0');
    const refCode = `${todayPrefix}-${seq}`;

    const newRepair: RepairSubmission = {
      id: refCode,
      name: repairCustName,
      phone: repairCustPhone,
      email: repairCustEmail,
      productName: repairProductName,
      modelSerial: repairModelSerial,
      problem: repairProblem,
      method: repairMethod,
      ref: refCode,
      status: "Received",
      submittedAt: new Date().toISOString(),
    };

    const ticketPayload = {
      ticket_type: "repair",
      customer_name: repairCustName,
      customer_contact: repairCustPhone + (repairCustEmail ? ` | ${repairCustEmail}` : ""),
      product_reference: repairProductName + (repairModelSerial ? ` | ${repairModelSerial}` : ""),
      issue_description: repairProblem,
      status: "Received",
      staff_notes: JSON.stringify({ ref: refCode, modelSerial: repairModelSerial, method: repairMethod })
    };

    try {
      const inserted = await db.insertSupportTicket(ticketPayload);
      newRepair.id = String(inserted.id);
    } catch (err) {
      console.error("Supabase save failed for repair, falling back to local list:", err);
      const updatedList = [newRepair, ...repairs];
      setRepairs(updatedList);
      saveLocal("ht_repairs", updatedList);
    }

    // Send separate, clean WhatsApp notification to Ruth
    const waText = `🔧 New Repair Ticket #${refCode} from ${repairCustName}
Product: ${repairProductName}
Model/Serial: ${repairModelSerial}
Fault Description: ${repairProblem}
Preferred Pickup Method: ${repairMethod}
Contact Phone: ${repairCustPhone}`;
    const link = `https://wa.me/2348034832773?text=${encodeURIComponent(waText)}`;
    window.open(link, "_blank");

    // Email link
    window.location.href = `mailto:hitechdistributors@gmail.com?subject=Repair Request ${refCode}&body=${encodeURIComponent(waText)}`;

    // Reset Form
    setRepairCustName("");
    setRepairCustPhone("");
    setRepairCustEmail("");
    setRepairProductName("");
    setRepairModelSerial("");
    setRepairProblem("");
    setRepairMethod("In-Store");
    setSubmittingRepair(false);

    // Set Track Ref to the generated ticket for easy subsequent check
    setTrackRef(refCode);

    setRepairSuccess(`✅ Your repair ticket #${refCode} has been received. Our repairs team (Ruth) will contact you within 24 hours.`);
  };

  // Track My Repair
  const handleTrackRepair = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackResult(null);

    if (!trackRef) {
      setTrackError("Please enter your repair reference number.");
      return;
    }

    const match = repairs.find(r => r.ref.toLowerCase() === trackRef.trim().toLowerCase());
    if (match) {
      setTrackResult(match);
    } else {
      setTrackError("Repair reference not found. Please verify and try again.");
    }
  };

  // Interactive Solar Sizing
  const handleSizingRecommendation = async () => {
    setSizingLoading(true);
    setSizingRecommendation(null);

    try {
      const res = await fetch("/api/gemini/solar-sizing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliances: sizingAppliances }),
      });
      if (res.ok) {
        const data = await res.json();
        setSizingRecommendation(data);
      } else {
        alert("Sizing estimation service temporary busy. Please try again.");
      }
    } catch (e) {
      alert("Failed to connect to solar sizing calculation engine.");
    } finally {
      setSizingLoading(false);
    }
  };

  const updateApplianceCount = (id: string, delta: number) => {
    setSizingAppliances(sizingAppliances.map(a => {
      if (a.id === id) {
        const count = a.count + delta;
        return { ...a, count: count < 0 ? 0 : count };
      }
      return a;
    }));
  };

  // Escalation Submit
  const submitEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escName || !escPhone || !escDesc || !escUrgency) return;
    setSubmittingEsc(true);
    
    const ticketNum = "MGR-" + Math.floor(100 + Math.random() * 900);
    const newEsc = {
      id: ticketNum,
      name: escName,
      phone: escPhone,
      email: escEmail,
      ref: escRef,
      desc: escDesc,
      urgency: escUrgency,
      timestamp: Date.now()
    };
    
    const ticketPayload = {
      ticket_type: "gm_escalation",
      customer_name: escName,
      customer_contact: escPhone + (escEmail ? ` | ${escEmail}` : ""),
      product_reference: escRef || "General Escalation",
      issue_description: `${escUrgency}: ${escDesc}`,
      status: "pending",
      staff_notes: JSON.stringify({ ref: ticketNum, urgency: escUrgency })
    };

    try {
      const inserted = await db.insertSupportTicket(ticketPayload);
      newEsc.id = String(inserted.id);
    } catch(err) {
      console.error("Supabase save failed for escalation:", err);
    }

    const eseText = `⭐ New Escalation Request from ${escName}
Inquiry Type: ${escUrgency}
Issue: ${escDesc}
Please review and generate escalation code.`;

    const lucyText = `⭐ New Escalation Request from ${escName}
Inquiry Type: ${escUrgency}
Issue: ${escDesc}
Please review and generate escalation code. (Backup)`;

    const emailText = `⭐ New Escalation Request #${ticketNum} from ${escName}
Inquiry Type: ${escUrgency}
Customer: ${escName}
Phone: ${escPhone}
Email: ${escEmail || "N/A"}
Issue: ${escDesc}`;

    // Open WhatsApp to Ese
    window.open(`https://wa.me/2347032724432?text=${encodeURIComponent(eseText)}`, "_blank");
    
    // Open WhatsApp to Lucy (with delay to prevent popup blocking)
    setTimeout(() => {
      window.open(`https://wa.me/2349166241953?text=${encodeURIComponent(lucyText)}`, "_blank");
    }, 500);

    // Forward to GM (with delay)
    setTimeout(() => {
      const gmText = `⭐ Escalation Forwarded #${ticketNum}
Inquiry Type: ${escUrgency}
Customer: ${escName}
Phone: ${escPhone}
Issue: ${escDesc}`;
      window.open(`https://wa.me/2348032175552?text=${encodeURIComponent(gmText)}`, "_blank");
    }, 1000);

    // Launch Email (with delay to prevent popup blocking)
    setTimeout(() => {
      window.location.href = `mailto:hitechdistributors@gmail.com,hitechd@hitechd.com?subject=New Escalation Request ${ticketNum}&body=${encodeURIComponent(emailText)}`;
    }, 1500);
    
    setEscSuccess(`Your ticket #${ticketNum} has been received. A Service Advisor will contact you within 24 hours.`);
    setSubmittingEsc(false);
    setEscName("");
    setEscPhone("");
    setEscEmail("");
    setEscRef("");
    setEscDesc("");
    setEscUrgency("Medium");
  };

  // GM Message Queue Submit
  const submitGMContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmMsgText || !gmCustName || !gmCustPhone) {
      alert("Please fill out your name, contact phone, and message.");
      return;
    }

    const requestRecord: GMRequest = {
      id: "GMR-" + Date.now().toString().slice(-6),
      type: gmMsgType,
      message: gmMsgText,
      name: gmCustName,
      phone: gmCustPhone,
      preferredTime: gmPrefTime || "Anytime",
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    const ticketPayload = {
      ticket_type: "gm_escalation",
      customer_name: gmCustName,
      customer_contact: gmCustPhone,
      product_reference: "GM Direct Contact",
      issue_description: `${gmMsgType}: ${gmMsgText}`,
      status: "pending",
      staff_notes: JSON.stringify({ ref: requestRecord.id, preferredTime: gmPrefTime })
    };

    try {
      const inserted = await db.insertSupportTicket(ticketPayload);
      requestRecord.id = String(inserted.id);
    } catch (e) {
      console.error("Supabase save failed for GM contact:", e);
      const list = [requestRecord, ...gmRequests];
      setGmRequests(list);
      saveLocal("ht_gm_requests", list);
    }

    setGmMsgSent(true);
    setGmMsgText("");
    setGmCustName("");
    setGmCustPhone("");
    setGmPrefTime("");
  };

  // AI Chat message sender
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user" as const, text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMsg] }),
      });
      if (res.ok) {
        const data = await res.json();
        
        // Render answer
        setChatMessages(prev => [...prev, { sender: "ai", text: data.text }]);

        // Handle tool use / function calling
        if (data.functionCalls) {
          for (const call of data.functionCalls) {
            if (call.name === "add_to_cart") {
              const { productId } = call.args;
              const prod = products.find(p => p.id === productId) || solarProducts.find(s => s.id === productId);
              if (prod) {
                addToCart(prod);
                setChatMessages(prev => [...prev, { sender: "ai", text: `[System Action]: successfully added "${prod.n}" to your quote/cart!` }]);
              }
            } else if (call.name === "open_whatsapp") {
              const { enquiryText } = call.args;
              const link = `https://wa.me/${WA_SALES}?text=${encodeURIComponent(enquiryText)}`;
              setChatMessages(prev => [...prev, { sender: "ai", text: `[System Action]: Opening WhatsApp enquiry link for you...` }]);
              window.open(link, "_blank");
            }
          }
        }
      } else {
        setChatMessages(prev => [...prev, { sender: "ai", text: "I'm experiencing slightly higher latency right now. Let me know if you want me to try again!" }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "Oops, my solar circuits dropped for a split second. Let me re-tackle that question." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Feedback submit
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName || !feedComment) {
      alert("Please specify review name and comments.");
      return;
    }

    const review: FeedbackReview = {
      id: "REV-" + Date.now().toString().slice(-6),
      name: feedName,
      rating: feedRating,
      comment: feedComment,
      timestamp: new Date().toISOString(),
    };

    const feedbackPayload = {
      customer_name: feedName,
      rating: feedRating,
      comment: feedComment
    };

    try {
      const inserted = await db.insertFeedback(feedbackPayload);
      review.id = String(inserted.id);
    } catch (e) {
      console.error("Supabase feedback insert failed:", e);
      const list = [review, ...feedbacks];
      setFeedbacks(list);
      saveLocal("ht_feedbacks", list);
    }

    setFeedName("");
    setFeedComment("");
    alert("Thank you so much for your premium review and score!");
  };

  // Pickup Booking
  const handlePickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !pickupName || !pickupPhone || !pickupItems) {
      alert("Please complete the schedule inputs.");
      return;
    }

    const booking: PickupSlot = {
      id: "PKP-" + Date.now().toString().slice(-6),
      name: pickupName,
      phone: pickupPhone,
      items: pickupItems,
      date: pickupDate,
      timeSlot: pickupTimeSlot,
      status: "scheduled",
      timestamp: new Date().toISOString(),
    };

    const slotPayload = {
      customer_name: pickupName,
      customer_contact: pickupPhone,
      order_reference: pickupItems,
      pickup_date: pickupDate,
      pickup_time: pickupTimeSlot,
      status: "scheduled"
    };

    try {
      const inserted = await db.insertPickupSlot(slotPayload);
      booking.id = String(inserted.id);
    } catch (e) {
      console.error("Supabase pickup insert failed:", e);
      const list = [booking, ...pickups];
      setPickups(list);
      saveLocal("ht_pickups", list);
    }

    setPickupBooked(true);
    setPickupName("");
    setPickupPhone("");
    setPickupItems("");
  };

  // Shadow School application submit
  const handleShadowSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schName || !schPhone || !schEmail || !schAge || !schProgram || !schReason) {
      alert("Please fill in all required fields.");
      return;
    }

    const ageVal = parseInt(schAge, 10);
    if (isNaN(ageVal) || ageVal < 10 || ageVal > 120) {
      alert("Please enter a valid age between 10 and 120.");
      return;
    }

    setSubmittingSch(true);
    setSchSuccess(null);

    const application = {
      id: "SCH-" + Date.now().toString().slice(-6),
      name: schName,
      phone: schPhone,
      email: schEmail,
      age: ageVal,
      program: schProgram,
      reason: schReason,
      timestamp: new Date().toISOString(),
    };

    const ticketPayload = {
      ticket_type: "school_application",
      customer_name: schName,
      customer_contact: schPhone + " | " + schEmail,
      product_reference: schProgram,
      issue_description: schReason,
      status: "pending",
      staff_notes: JSON.stringify({ age: ageVal })
    };

    try {
      const inserted = await db.insertSupportTicket(ticketPayload);
      application.id = String(inserted.id);
    } catch (error) {
      console.error("Failed to save to Supabase, falling back to local storage:", error);
      try {
        const localApps = localStorage.getItem("ht_school_applications");
        const list = localApps ? JSON.parse(localApps) : [];
        list.push(application);
        localStorage.setItem("ht_school_applications", JSON.stringify(list));
      } catch (e) {
        console.error("Local storage fallback failed:", e);
      }
    }

    // Prepare message contents
    const messageText = `🎓 *NEW SHADOW SCHOOL APPLICATION*

👤 *Name:* ${schName}
📞 *Phone:* ${schPhone}
📧 *Email:* ${schEmail}
🎂 *Age:* ${schAge}
🎯 *Program:* ${schProgram}
📝 *Why join?:* ${schReason}`;

    // Send WhatsApp to Ese (+234 703 272 4432)
    const eseWaUrl = `https://wa.me/2347032724432?text=${encodeURIComponent(messageText)}`;
    window.open(eseWaUrl, "_blank");

    // Send confirmation email to hitechdistributors@gmail.com
    setTimeout(() => {
      window.location.href = `mailto:hitechdistributors@gmail.com?subject=Shadow School Application - ${encodeURIComponent(schName)}&body=${encodeURIComponent(messageText)}`;
    }, 1000);

    setSchSuccess("✅ Your application has been received! We will contact you shortly.");
    
    // Reset form fields
    setSchName("");
    setSchPhone("");
    setSchEmail("");
    setSchAge("");
    setSchProgram("Computer Repairs");
    setSchReason("");
    setSubmittingSch(false);
  };

  // Staff Room login authentication
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    if (staffPIN === "12345" || staffPIN === "qw123#@") {
      setStaffIsLoggedIn(true);
    } else {
      setStaffError("Invalid Access PIN or Manager Key.");
    }
  };

  // CSV Google Sheets sheet importer parser
  const parseCsvRow = (text: string) => {
    const rows: string[][] = [];
    let inQuotes = false;
    let currentWord = '';
    let currentRow: string[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i+1] === '"') {
          currentWord += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentWord.trim());
        currentWord = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentWord.trim());
        rows.push(currentRow);
        currentRow = [];
        currentWord = '';
      } else {
        currentWord += char;
      }
    }
    if (currentWord || currentRow.length > 0) {
      currentRow.push(currentWord.trim());
      rows.push(currentRow);
    }
    return rows;
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) {
      setCsvStatus("Please enter CSV sheet text.");
      return;
    }

    try {
      const rows = parseCsvRow(csvText);
      const importedProducts: Product[] = [];
      
      rows.forEach((cols, i) => {
        if (i === 0 || cols.length < 2) return; // skip header or empty rows
        
        // If the first column is a pure number or if the header has "No.", we assume shifted cols
        const isShifted = !isNaN(Number(cols[0]?.trim())) || rows[0][0]?.toLowerCase().startsWith("no");
        const offset = isShifted ? 1 : 0;
        const displayOrder = isShifted ? cols[0]?.trim() : String(i);

        if (cols.length >= 6 + offset) {
          const rawCat = cols[2 + offset]?.trim().toLowerCase() || "laptops";
          // determine a simpler category string for filtering
          let mappedCat = "laptops";
          if (rawCat.includes("printer") || rawCat.includes("copier")) mappedCat = "printers";
          if (rawCat.includes("desktop") || rawCat.includes("all-in-one")) mappedCat = "desktops";
          if (rawCat.includes("solar") || rawCat.includes("inverter") || rawCat.includes("battery") || rawCat.includes("ups") || rawCat.includes("stabilizer")) mappedCat = "solar";

          importedProducts.push({
            id: `csv-${displayOrder}`, // Unique ID for this row to allow merging
            displayOrder: displayOrder,
            brand: cols[0 + offset]?.trim() || "HITECH",
            pn: cols[1 + offset]?.trim() || "—",
            cat: mappedCat,
            n: cols[2 + offset]?.trim() || "Imported Product", // Use the original category as product name/family
            desc: cols[3 + offset]?.trim() || "Imported from CSV Sheet",
            bullets: cols[4 + offset]?.trim() || "",
            sp: cols[5 + offset]?.trim() || "Imported Specifications",
            price: cols[6 + offset]?.trim() || "CALL",
            assuranceLayer: cols[7 + offset]?.trim() || "No",
            assuranceText: cols[8 + offset]?.trim() || "",
            laggardLayer: cols[9 + offset]?.trim() || "No",
            laggardPromoText: cols[10 + offset]?.trim() || "",
            imgManual: cols[11 + offset]?.trim() || "",
            imgFront: cols[12 + offset]?.trim() || "",
            imgSide: cols[13 + offset]?.trim() || "",
            imgBack: cols[14 + offset]?.trim() || "",
            imgTop: cols[15 + offset]?.trim() || "",
            imgVideo: cols[16 + offset]?.trim() || "",
            stock: cols[17 + offset]?.trim() || "In Stock",
            staffNotes: cols[18 + offset]?.trim() || "",
            searchKeywords: cols[19 + offset]?.trim() || "",
            color: cols[20 + offset]?.trim() || "",
            needsVerification: cols[21 + offset]?.trim() || "No",
            floorDisplay: cols[22 + offset]?.trim() || "No",
            promo: cols[18 + offset]?.trim() === "PROMO", 
            newp: cols[18 + offset]?.trim() === "NEW" 
          });
        }
      });

      if (importedProducts.length > 0) {
        setCsvStatus(`Saving ${importedProducts.length} items to Supabase storage...`);
        try {
           // Fetch all existing products for "hitech" to map row_numbers & product_codes to real DB ids
           const { data: existingDbProducts } = await supabase
             .from("products")
             .select("id, row_number, product_code")
             .eq("client_id", "hitech");

           const dbMapByRow = new Map<number, number>();
           const dbMapByCode = new Map<string, number>();
           if (existingDbProducts) {
             existingDbProducts.forEach((item: any) => {
               if (item.row_number) dbMapByRow.set(Number(item.row_number), Number(item.id));
               if (item.product_code) dbMapByCode.set(String(item.product_code).trim(), Number(item.id));
             });
           }

           const mappedProducts = importedProducts.map(p => {
             const rowNum = p.displayOrder ? Number(p.displayOrder) : undefined;
             const prodCode = p.pn ? String(p.pn).trim() : undefined;
             
             let existingId: number | undefined = undefined;
             if (prodCode && prodCode !== "—" && prodCode !== "-" && dbMapByCode.has(prodCode)) {
               existingId = dbMapByCode.get(prodCode);
             } else if (rowNum && dbMapByRow.has(rowNum)) {
               existingId = dbMapByRow.get(rowNum);
             }

             return {
               id: existingId,
               client_id: "hitech",
               row_number: rowNum,
               brand: p.brand,
               product_code: p.pn,
               category: p.cat,
               description_headline: p.n,
               extra_details: p.desc,
               description_bullets: p.bullets,
               technical_specs: p.sp,
               price: p.price,
               assurance_layer: p.assuranceLayer === "Yes" || p.assuranceLayer === "true",
               assurance_text: p.assuranceText,
               laggard_layer: p.laggardLayer === "Yes" || p.laggardLayer === "true",
               laggard_promo_text: p.laggardPromoText,
               main_image_url: p.imgManual,
               front_image_url: p.imgFront,
               side_image_url: p.imgSide,
               back_image_url: p.imgBack,
               top_image_url: p.imgTop,
               video_url: p.imgVideo,
               stock_status: p.stock,
               staff_notes: p.staffNotes,
               search_keywords: p.searchKeywords,
               color_variant: p.color,
               needs_verification: p.needsVerification === "Yes",
               floor_display: p.floorDisplay === "Yes",
               show_in_sale_room: !!p.promo,
               show_in_seasonal_promo: !!p.newp
             };
           });

           const { error } = await supabase
             .from("products")
             .upsert(mappedProducts);

           if (error) throw error;
           
           // Fetch the updated list of products from DB to get the new real IDs assigned to them
           const supabaseProducts = await db.fetchProducts();
           if (supabaseProducts && supabaseProducts.length > 0) {
             const mapped = supabaseProducts.map((p: any) => ({
               id: String(p.id),
               displayOrder: String(p.row_number),
               brand: p.brand || "HITECH",
               pn: p.product_code || "",
               cat: p.category || "laptops",
               n: p.description_headline || "Imported Product",
               desc: p.extra_details || p.description_bullets || "",
               bullets: p.description_bullets || "",
               sp: p.technical_specs || "",
               price: p.price || "CALL",
               assuranceLayer: p.assurance_layer ? "Yes" : "No",
               assuranceText: p.assurance_text || "",
               laggardLayer: p.laggard_layer ? "Yes" : "No",
               laggardPromoText: p.laggard_promo_text || "",
               imgManual: p.main_image_url || "",
               imgFront: p.front_image_url || "",
               imgSide: p.side_image_url || "",
               back_image_url: p.back_image_url || "",
               top_image_url: p.top_image_url || "",
               imgVideo: p.video_url || "",
               stock: p.stock_status || "In Stock",
               staffNotes: p.staff_notes || "",
               searchKeywords: p.search_keywords || "",
               color: p.color_variant || "",
               needsVerification: p.needs_verification ? "Yes" : "No",
               floorDisplay: p.floor_display ? "Yes" : "No",
               promo: p.show_in_sale_room || false,
               newp: p.show_in_seasonal_promo || false
             }));

             const laptopPrinters = mapped.filter((p: any) => ["laptops", "printers", "desktops"].includes(p.cat));
             setProducts(laptopPrinters);
           } else {
             setProducts(importedProducts);
           }
           
           setCurrentPreset("LAST IMPORTED SHEET");
           setCsvStatus(`✅ Data saved successfully! All products and images are stored permanently.`);
        } catch (err: any) {
           console.error("Supabase sheet save error:", err);
           setCsvStatus("❌ Failed to save data: " + err.message);
        }
      } else {
        setCsvStatus("Could not parse any valid rows. Ensure format matches the template.");
      }
    } catch (err: any) {
      setCsvStatus("Error parsing CSV: " + err.message);
    }
  };

  const PresetSelector = () => (
    <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)] mb-4">
      <h4 className="font-bold text-xs text-[var(--yl)] uppercase mb-3 flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5" /> PRESETS
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "DEFAULT", label: "DEFAULT", sub: "131-155", color: "text-blue-400", border: "border-blue-500/30" },
          { id: "PROMO HIGH", label: "PROMO HIGH", sub: "DEALS", color: "text-orange-400", border: "border-orange-500/30" },
          { id: "SEASONAL DEALS", label: "SEASONAL", sub: "DEALS", color: "text-amber-400", border: "border-amber-500/30" },
          { id: "WORKBOOK DISPLAY", label: "WORKBOOK DISPLAY", sub: "(CSV Data)", color: "text-purple-400", border: "border-purple-500/30" },
          { id: "LAST IMPORTED SHEET", label: "LAST IMPORTED", sub: "SHEET", color: "text-emerald-400", border: "border-emerald-500/30" }
        ].map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              setCurrentPreset(preset.id as any);
              if (preset.id === "DEFAULT") {
                const defSelection = Array.from({ length: 25 }, (_, i) => String(131 + i));
                setDisplayFloorSelection(defSelection);
                localStorage.setItem("ht_display_floor_config", JSON.stringify(defSelection));
              } else if (preset.id === "LAST IMPORTED SHEET") {
                const impSelection = Array.from({ length: 155 }, (_, i) => String(1 + i));
                setDisplayFloorSelection(impSelection);
                localStorage.setItem("ht_display_floor_config", JSON.stringify(impSelection));
              }
            }}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center relative ${currentPreset === preset.id ? "bg-slate-800 shadow-inner " + preset.border : "bg-slate-950 border-slate-800"}`}
          >
            <span className={`text-[10px] font-black tracking-wider ${preset.color}`}>{preset.label}</span>
            <span className="text-[8px] text-[var(--mu)] font-mono mt-0.5">
               {customPresets[preset.id] ? `${customPresets[preset.id].length} Items` : preset.sub}
            </span>
            {currentPreset === preset.id && (
              <div 
                className="absolute top-1 right-1 p-1 bg-slate-700/50 rounded hover:bg-slate-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPreset(preset.id);
                }}
              >
                <Settings className="w-3 h-3 text-slate-300" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Preset Editor Modal */}
      <AnimatePresence>
        {editingPreset && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1050] bg-[#1a2a4a]/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-[var(--yl)]" />
                  Edit Preset: {editingPreset}
                </h3>
                <button onClick={() => setEditingPreset(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-2 block">Current Numbers:</label>
                  <div className="flex flex-wrap gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 min-h-[100px] content-start shadow-inner max-h-48 overflow-y-auto">
                    {editingNumbers.map((num, i) => (
                      <div key={`${num}-${i}`} className="bg-slate-800 border border-slate-700 rounded flex items-center overflow-hidden group">
                        <span className="px-2 py-1 text-xs font-mono text-slate-200">{num}</span>
                        <button 
                          onClick={() => setEditingNumbers(prev => prev.filter((_, idx) => idx !== i))}
                          className="px-1.5 py-1 bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white transition-colors border-l border-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {editingNumbers.length === 0 && (
                      <span className="text-slate-500 text-xs italic">No numbers in this preset.</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-2 block">Add Numbers:</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newNumbersInput}
                      onChange={(e) => setNewNumbersInput(e.target.value)}
                      placeholder="e.g. 45, 46, 131-135"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNumbers();
                      }}
                    />
                    <button 
                      onClick={handleAddNumbers}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">Enter comma-separated numbers or ranges (e.g., 45, 46, 50-55)</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
                <button 
                  onClick={async () => {
                    const newPresets = { ...customPresets, [editingPreset]: editingNumbers };
                    setCustomPresets(newPresets);
                    localStorage.setItem("ht_custom_presets", JSON.stringify(newPresets));
                    setEditingPreset(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Preset
                </button>
                <button 
                  onClick={() => setEditingPreset(null)}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render repair stage dots
  const getStageDotClass = (currentStatus: string, stage: string, index: number, list: string[]) => {
    const activeIndex = list.indexOf(currentStatus);
    if (activeIndex === index) return "bg-[var(--yl)] border-2 border-white scale-125";
    if (activeIndex > index) return "bg-[var(--gr)]";
    return "bg-slate-700";
  };

  return (
    <div id="app" className="flex flex-col min-h-screen text-[var(--cr)] overflow-x-hidden font-sans bg-[var(--dk)]">
      
      {!inStore ? (
        // 3.3 Landing Page - Editorial Aesthetic
        <div className="flex flex-col justify-between flex-grow p-6 select-none bg-[var(--dk)]">
          
          <div className="pt-8">
            <div className="flex justify-between items-center border-b-4 border-[#1a2a4a] pb-4 mb-6">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-[.4em] uppercase mb-1.5 opacity-60 font-sans">COMPUTER & SOLAR ELECTRONICS HUB</span>
                <HitechLogo size="lg" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-serif italic text-black">v.2.40 Beta</span>
              </div>
            </div>
            
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-left text-xs font-serif italic text-slate-800 leading-relaxed max-w-sm mb-4"
            >
              HiTech Distributors is an authorized distributor of HP, Dell, and certified solar solutions. We supply computers, laptops, printers, solar equipment, UPS/inverters, networking, CCTV, cameras, phones & tablets & accessories and computer accessories — including inks, toners, cables, and spare parts. We also offer professional repairs, diagnostics, and customer support for all your office technology needs. Built for performance, reliability, and innovation.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
              className="text-left text-[9px] tracking-[2px] text-red-700 uppercase font-bold font-mono"
            >
              Active Deployment: Lagos/Warri SFO_92
            </motion.p>
          </div>


          {/* HiTech Distributors Storefront Facade - Styled with a beautiful glowing dark blue border */}
          <div className="my-6 overflow-hidden rounded-xl border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] relative h-[220px] bg-slate-900 flex justify-center items-center">
            <img
              src={storefrontImage}
              alt="HiTech Distributors Facade"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center brightness-95 hover:brightness-100 transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const primaryFallback = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
                if (target.src !== primaryFallback) {
                  target.src = primaryFallback;
                }
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 pt-8 flex justify-between items-end">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">Flagship Outlet</span>
                <h4 className="text-xs font-black uppercase text-white mt-1">HiTech Distributors</h4>
              </div>
              <span className="text-[9px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded">Nigeria</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 pb-6">
            <div className="flex flex-wrap gap-1.5 justify-start py-2">
              {["Laptops", "Printers", "☀ Solar Hub", "Desktops", "CCTV", "Repairs"].map((tag, idx) => (
                <span key={idx} className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#1a2a4a] bg-white text-black">
                  {tag}
                </span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setInStore(true); setCurrentRoom("showroom"); }}
              className="w-full py-4 bg-[#1a2a4a] text-white font-bold uppercase tracking-widest text-xs border-2 border-[#1a2a4a] hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(26,42,74,1)] hover:shadow-none"
            >
              Enter Showroom →
            </motion.button>

            <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase text-center mt-2">
              {STORE.addr} · {STORE.phone}
            </p>
            <button 
              onClick={() => setShowGuide(true)}
              className="text-blue-500 text-xs font-bold mt-2 hover:text-blue-400 transition-colors"
            >
              ℹ️ How to Use the Hublet
            </button>
          </div>
        </div>
      ) : (
        // Main App Experience
        <div className="flex flex-col flex-grow bg-[var(--dk)] pb-24">
          
          {/* 3.4 Topboard - Fixed top bar */}
          <header className="sticky top-0 z-40 w-full bg-[var(--dk)]/95 backdrop-blur-md border-b-4 border-[#1a2a4a] py-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
              <button onClick={handleBack} className="h-[44px] px-3 font-bold text-sm flex justify-center items-center bg-white text-[#1a2a4a] border border-[#1a2a4a] rounded shadow-sm hover:bg-slate-100 transition-colors flex-shrink-0 whitespace-nowrap">
                &larr; Back
              </button>
              <button onClick={() => setInStore(false)} className="h-[44px] w-[44px] flex justify-center items-center border border-[#1a2a4a] bg-white text-black hover:bg-[#1a2a4a] hover:text-white transition-colors rounded flex-shrink-0">
                <Home className="w-5 h-5" />
              </button>
              <div className="flex-shrink-0 min-w-0 hidden sm:block">
                <HitechLogo size="sm" className="ml-1" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => setShowGuide(true)} 
                className="h-[44px] px-3 font-bold text-xs flex justify-center items-center bg-blue-50/10 text-blue-400 border border-blue-900/50 rounded shadow-sm hover:bg-blue-900/30 hover:text-blue-300 transition-colors whitespace-nowrap mr-1"
              >
                ℹ️ Guide
              </button>
              <span className="text-[9px] font-mono uppercase tracking-wider bg-[#1a2a4a] text-white px-2.5 py-1 border border-[#1a2a4a] flex items-center gap-1">
                <span>{currentRoom}</span>
              </span>
              {cart.length > 0 && (
                <button onClick={() => setCurrentRoom("invoice")} className="relative p-1.5 border border-[#1a2a4a] bg-white text-black">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Room Content */}
          <main className="content-area flex-grow p-4 overflow-y-auto max-w-[430px] mx-auto w-full">
            
            {/* Showroom Room */}
            {currentRoom === "showroom" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Teleprompter text="Welcome to the Showroom! Browse our full product catalogue by category. Select a category to view products, and click 'Add to Order' to start building your order." />
                <PresetSelector />
                <div className="mb-8 p-6 bg-[var(--dk)] border-4 border-[#1a2a4a] shadow-[8px_8px_0px_0px_rgba(26,42,74,1)]">
                  <h3 className="text-black font-black uppercase text-2xl tracking-tighter mb-2 flex items-center gap-2">
                    <Building className="w-6 h-6" /> HiTech Distributors Hub
                  </h3>
                  <p className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">{STORE.addr}</p>
                  <div className="flex gap-3 items-center text-xs font-bold uppercase border-t-2 border-[#1a2a4a] pt-4">
                    <span className={`w-3 h-3 border-2 border-[#1a2a4a] ${managerAvailable ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-black">{managerAvailable ? "Manager Available In-Store" : "Manager Busy / On-Site"}</span>
                  </div>
                </div>

                {!activeCategory ? (
                  <>
                    <h4 className="text-[10px] font-bold uppercase tracking-[.3em] text-slate-400 mb-4 border-b-2 border-[#1a2a4a] pb-2">Browse Directory</h4>
                    <div className="grid grid-cols-2 gap-px bg-[#1a2a4a] border-2 border-[#1a2a4a] mb-8">
                      {CATEGORIES.map((cat, idx) => {
                        const count = displayedProducts.filter(p => p.cat === cat.id).length;
                        const indexStr = String(idx + 1).padStart(2, '0');
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="bg-[var(--dk)] p-5 flex flex-col justify-between hover:invert transition-all cursor-pointer group min-h-[140px] text-left"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-3xl font-serif italic font-light text-black opacity-80">{indexStr}</span>
                              <div className="text-black opacity-50 group-hover:opacity-100 transition-opacity">
                                {cat.id === "laptops" && <Laptop className="w-5 h-5" />}
                                {cat.id === "printers" && <Printer className="w-5 h-5" />}
                                {cat.id === "desktops" && <Monitor className="w-5 h-5" />}
                                {cat.id === "cameras" && <Camera className="w-5 h-5" />}
                                {cat.id === "cctv" && <Shield className="w-5 h-5" />}
                                {cat.id === "networking" && <Network className="w-5 h-5" />}
                                {cat.id === "monitors" && <Tv className="w-5 h-5" />}
                                {cat.id === "software" && <Cpu className="w-5 h-5" />}
                                {cat.id === "accessories" && <FolderPlus className="w-5 h-5" />}
                                {cat.id === "phones" && <Smartphone className="w-5 h-5" />}
                              </div>
                            </div>
                            <div className="mt-4">
                              <h5 className="font-bold text-lg uppercase leading-tight text-black">{cat.name}</h5>
                              <p className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-50 text-black mt-1">{count} entries</p>
                            </div>
                          </button>
                        );
                      })}
                      
                      {/* Special 11th Solar Hub tile */}
                      <button
                        onClick={() => setCurrentRoom("solar")}
                        className="bg-[var(--dk)] p-5 flex flex-col justify-between hover:bg-[#1a2a4a] hover:text-white transition-all cursor-pointer group min-h-[140px] text-left col-span-2 border-t border-[#1a2a4a]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-3xl font-serif italic font-light opacity-80">11</span>
                          <div className="text-[#dc3545]">
                            <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: "10s" }} />
                          </div>
                        </div>
                        <div className="mt-4">
                          <h5 className="font-bold text-xl uppercase leading-tight">Solar Infrastructure</h5>
                          <p className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-50 mt-1">{displayedSolarProducts.length} entries</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-end mb-6 border-b-4 border-[#1a2a4a] pb-4">
                      <button onClick={() => setActiveCategory(null)} className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-2 hover:opacity-50">
                        <span className="text-lg">←</span> Back
                      </button>
                      <h4 className="text-3xl font-black uppercase tracking-tighter text-black leading-none">
                        {CATEGORIES.find(c => c.id === activeCategory)?.name}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-4">
                      {displayedProducts.filter(p => p.cat === activeCategory).map((p, index) => (
                        <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} displayPrice={getDisplayPrice(p)} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Display Floor Room */}
            {currentRoom === "display" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Display Floor! This room mirrors our physical store layout. The products shown here are exactly what you'll find on our actual shop floor. Each card has a number (#1 to #42) to help you identify products quickly." />
                <PresetSelector />
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-[var(--border)] text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-3 text-emerald-400">
                    <SparklesIcon className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-[var(--yl)] font-bold mb-1">Display Floor Highlights</h3>
                  <p className="text-[11px] text-[var(--mu)] mb-2">Virtual interactive showroom display stand. Tap any product to view premium live specifications.</p>
                  <p className="text-[10px] text-white bg-slate-800/50 p-2 rounded border border-slate-700/50 inline-block font-medium">💡 Tap any preset above to change the view.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {displayedProducts.slice(0, 42).map((p, index) => (
                    <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} displayPrice={getDisplayPrice(p)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hit Deals Room */}
            {currentRoom === "deals" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                <Teleprompter text="Welcome to Hot Deals! Don't miss out on our best promotions and discounts. These products are available at special prices. Act fast — these deals won't last long!" />
                <PresetSelector />
                <div className="p-6 bg-[#1a2a4a] border-4 border-[#1a2a4a] mb-2 shadow-[8px_8px_0px_0px_rgba(26,42,74,1)]">
                  <h3 className="text-white font-black uppercase tracking-tighter text-2xl flex items-center gap-2 mb-2">
                    <Tag className="w-6 h-6 text-red-500" /> Active Flash Deals
                  </h3>
                  <p className="text-xs font-mono tracking-widest uppercase text-white">Exclusive promotional flash discounts. Claim to reserve on WhatsApp before stock finishes.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {displayedProducts.filter(p => p.promo).map((p, index) => (
                    <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} displayPrice={getDisplayPrice(p)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Price List Room (Live Price-Sheet) */}
            {currentRoom === "livesheet" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                <Teleprompter text="Welcome to the Complete Price List! View our full product catalogue with all prices. Use the search bar to find specific products, or filter by category. This list is updated live from our Google Sheets data." />
                <PresetSelector />
                <div className="p-3 rounded-xl bg-slate-900 border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--yl)]">Complete Live Price Sheet</h3>
                    <p className="text-[10px] text-[var(--mu)] font-mono">Current Preset: {currentPreset}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-2 py-1.5 rounded border border-slate-700">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[10px] text-slate-300 uppercase">{currentPreset}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex border-b border-slate-800 pb-2 text-[10px] uppercase tracking-wider text-[var(--mu)] font-mono">
                    <span className="w-2/3">Item Details</span>
                    <span className="w-1/3 text-right">Live Price</span>
                  </div>
                  {displayedProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-slate-800/40 hover:bg-slate-900/30 px-1 cursor-pointer rounded"
                         onClick={() => setSelectedProduct(p)}>
                      <div className="min-w-0 w-2/3 pr-2">
                        <p className="font-bold text-xs text-slate-200 truncate">{p.n}</p>
                        <p className="text-[9px] text-[var(--mu)] truncate font-mono">{p.sp}</p>
                      </div>
                      <div className="price w-1/3 text-right font-mono font-bold text-[#1a1a2e] text-xs">
                        {getDisplayPrice(p)}
                      </div>
                    </div>
                  ))}

                  <div className="h-[2px] bg-slate-800 my-4" />
                  <p className="text-[10px] uppercase text-[#dc3545] font-mono tracking-wider">☀ Solar Hub Live Sheet</p>
                  
                  {displayedSolarProducts.map(s => (
                    <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-slate-800/40 hover:bg-slate-900/30 px-1 cursor-pointer rounded"
                         onClick={() => setSelectedProduct(s)}>
                      <div className="min-w-0 w-2/3 pr-2">
                        <p className="font-bold text-xs text-[#1a1a2e] truncate">{s.n}</p>
                        <p className="text-[9px] text-[#dc3545] truncate font-mono">{s.sp}</p>
                      </div>
                      <div className="price w-1/3 text-right font-mono font-bold text-[#1a1a2e] text-xs">
                        {getDisplayPrice(s)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gallery Room */}
            {currentRoom === "gallery" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Gallery! Browse through our product images to get a feel for what HiTech Distributors offers. Click any image to learn more. Prices are shown below each image to give you a quick reference. Enjoy exploring!" />
                
                <PresetSelector />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-blue-400 font-bold text-base flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Media Gallery
                  </h3>
                  <p className="text-xs text-[var(--mu)] mb-3">Walkthrough pictures and visual catalog reviews of HiTech showroom.</p>
                  
                  <MediaUploadButton 
                    type="image" 
                    label="Upload Image to Gallery" 
                    onUploadSuccess={async (url) => {
                      const id = "img-" + Date.now().toString();
                      const payload = {
                        id,
                        title: "New Uploaded Photo",
                        caption: "User uploaded image",
                        url,
                        timestamp: new Date().toISOString()
                      };
                      const next = [payload, ...galleryImages];
                      setGalleryImages(next);
                      localStorage.setItem("ht_gallery_images", JSON.stringify(next));
                    }}
                  />
                </div>

                {/* Showroom Walkthrough Gallery displaying real-time Firestore galleryImages */}
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" /> Showroom Walkthroughs & Uploads
                  </h3>
                  
                  {galleryImages && galleryImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryImages.map((img: any, idx) => (
                        <div key={img.id || idx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col relative group">
                          <div className="h-44 bg-slate-900 flex items-center justify-center overflow-hidden relative">
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            {img.id && (
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to delete this walkthrough photo?")) {
                                    const next = galleryImages.filter(g => g.id !== img.id);
                                    setGalleryImages(next);
                                    localStorage.setItem("ht_gallery_images", JSON.stringify(next));
                                  }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow transition-colors z-10"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="p-3 flex flex-col flex-grow bg-slate-950 text-slate-100">
                            <h4 className="font-bold text-xs text-white leading-tight mb-1">{img.title}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{img.caption}</p>
                            <span className="text-[8px] font-mono text-slate-500 mt-2">
                              {img.timestamp ? new Date(img.timestamp).toLocaleDateString() : "Preset Walkthrough"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No custom walkthrough photos uploaded yet.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    try {
                      if (!displayedProducts || displayedProducts.length === 0) {
                        return (
                          <div className="col-span-full text-center py-12 text-slate-400 font-mono text-sm">
                            No products found in this preset selection.
                          </div>
                        );
                      }
                      return displayedProducts.map((p, index) => (
                        <GalleryCard 
                          key={p.id} 
                          product={p} 
                          index={index} 
                          total={displayedProducts.length} 
                          onView={setSelectedProduct} 
                        />
                      ));
                    } catch (error) {
                      console.error("Gallery Render Error:", error);
                      return (
                        <div className="col-span-full text-center py-12 text-red-400 font-mono text-sm bg-red-950/20 border border-red-900 rounded-xl">
                          ⚠️ Unable to load gallery images at this moment.
                        </div>
                      );
                    }
                  })()}
                </div>
              </motion.div>
            )}

            {/* Video Gallery Room */}
            {currentRoom === "video" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Video Gallery! Watch product demos, staff introductions, and tutorials. Click any video to play." />
                
                {/* Header & Controls */}
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="text-white font-bold text-sm">VIDEO GALLERY</h3>
                      <p className="text-xs text-slate-400">Demos, tutorials, and more</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {staffIsLoggedIn && (
                      <button 
                        onClick={() => {
                          setEditingVideo(null);
                          setShowVideoForm(true);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Video
                      </button>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search videos by title or category..." 
                    value={videoSearch}
                    onChange={(e) => setVideoSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-sm text-white rounded-lg pl-9 p-3 outline-none focus:border-red-500/50 transition-colors" 
                  />
                </div>

                {/* Video Form (Staff Only) */}
                {staffIsLoggedIn && showVideoForm && (
                  <div className="p-4 bg-slate-900 border border-emerald-900/30 rounded-xl flex flex-col gap-3">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase flex justify-between items-center">
                      <span>{editingVideo ? "✏️ Edit Video" : "➕ Add New Video"}</span>
                      <button onClick={() => setShowVideoForm(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </h4>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const newVideo: VideoGalleryItem = {
                          id: editingVideo ? editingVideo.id : `vid_${Date.now()}`,
                          title: fd.get("title") as string,
                          description: fd.get("description") as string,
                          url: fd.get("url") as string,
                          thumbnailUrl: fd.get("thumbnailUrl") as string,
                          category: fd.get("category") as string,
                          timestamp: editingVideo ? editingVideo.timestamp : new Date().toISOString(),
                          views: editingVideo ? editingVideo.views : "0"
                        };
                        
                        const nextVideos = editingVideo 
                          ? galleryVideos.map(v => v.id === editingVideo.id ? newVideo : v)
                          : [newVideo, ...galleryVideos];
                        
                        setGalleryVideos(nextVideos);
                        localStorage.setItem("ht_gallery_videos", JSON.stringify(nextVideos));
                        
                        setShowVideoForm(false);
                        setEditingVideo(null);
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input name="title" defaultValue={editingVideo?.title} required placeholder="Video Title *" className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-white" />
                      <textarea name="description" defaultValue={editingVideo?.description} placeholder="Video Description (Optional)" className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-white min-h-[60px]" />
                      <input name="url" defaultValue={editingVideo?.url} required placeholder="Video URL (YouTube, Vimeo, MP4) *" className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-white font-mono" />
                      
                      <div className="flex gap-2">
                        <input name="thumbnailUrl" defaultValue={editingVideo?.thumbnailUrl} placeholder="Thumbnail Image URL (Optional)" className="flex-1 bg-slate-950 border border-slate-800 p-2 text-xs rounded text-white font-mono" />
                        <select name="category" defaultValue={editingVideo?.category || "Tutorial"} className="w-[140px] bg-slate-950 border border-slate-800 p-2 text-xs rounded text-white">
                          <option value="Tutorial">Tutorial</option>
                          <option value="Demo">Demo</option>
                          <option value="Manager's Address">Manager's Address</option>
                          <option value="Installation">Installation</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider">
                          {editingVideo ? "Update Video" : "Save Video"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryVideos
                    .filter(v => 
                      v.title.toLowerCase().includes(videoSearch.toLowerCase()) || 
                      v.category.toLowerCase().includes(videoSearch.toLowerCase())
                    )
                    .map((vid) => (
                    <div key={vid.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg group flex flex-col">
                      <div 
                        className="w-full h-36 bg-slate-950 flex items-center justify-center relative overflow-hidden cursor-pointer"
                        onClick={() => setPlayingVideo(vid)}
                      >
                        {vid.thumbnailUrl ? (
                          <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <Video className="w-10 h-10 text-slate-700" />
                          </div>
                        )}
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                          <div className="w-12 h-12 bg-red-600/90 text-white rounded-full flex items-center justify-center pl-1 shadow-lg backdrop-blur-sm group-hover:scale-110 group-hover:bg-red-500 transition-all">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                        
                        <span className="absolute top-2 left-2 text-[9px] bg-[#1a2a4a] text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-blue-900/50">
                          {vid.category}
                        </span>
                      </div>
                      
                      <div className="p-3 flex flex-col flex-grow">
                        <h4 className="font-bold text-sm text-white leading-tight mb-1">{vid.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2 flex-grow">{vid.description}</p>
                        
                        <div className="flex justify-between items-end mt-auto pt-2 border-t border-slate-800">
                          <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            📅 {new Date(vid.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          
                          {staffIsLoggedIn && (
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingVideo(vid); setShowVideoForm(true); }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                               <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (confirm("Delete this video?")) {
                                    const newVids = galleryVideos.filter(v => v.id !== vid.id);
                                    setGalleryVideos(newVids);
                                    localStorage.setItem("ht_gallery_videos", JSON.stringify(newVids));
                                  }
                                }}
                                className="p-1.5 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {galleryVideos.filter(v => 
                      v.title.toLowerCase().includes(videoSearch.toLowerCase()) || 
                      v.category.toLowerCase().includes(videoSearch.toLowerCase())
                    ).length === 0 && (
                    <div className="col-span-1 sm:col-span-2 text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl border-dashed">
                      <Video className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-sm font-medium">No videos found</p>
                      <p className="text-slate-500 text-xs mt-1">Try a different search term or add a new video.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders & Invoicing Room */}
            {currentRoom === "invoice" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to Orders & Invoicing! Review your selected items, generate an invoice, and view payment instructions. Once you pay, staff will issue your official receipt." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-[var(--yl)] font-bold text-base flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Orders & Invoicing Desk
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Compile custom items, adjust quantities, review pricing, and generate invoices with automatic payment links.</p>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12 bg-[var(--dk2)] rounded-xl border border-[var(--border)]">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-400">Your shopping cart is currently empty.</p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <button onClick={() => setCurrentRoom("showroom")} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border border-slate-700">
                        🛒 Browse to Showroom
                      </button>
                      <button onClick={() => setCurrentRoom("livesheet")} className="px-4 py-2 bg-[var(--bl)] hover:bg-blue-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        📊 Browse to Price List
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Invoice Items</p>
                      {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                          <div className="min-w-0 pr-2">
                            <h4 className="font-bold text-xs text-slate-200 truncate">{item.product.n}</h4>
                            <p className="price text-[9px] text-[var(--mu)] font-mono">{getDisplayPrice(item.product)} x {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-950 rounded border border-slate-800">
                              <button onClick={() => updateCartQty(item.product.id, -1)} className="p-1 text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                              <span className="px-2 text-xs font-mono text-slate-200">{item.quantity}</span>
                              <button onClick={() => updateCartQty(item.product.id, 1)} className="p-1 text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-bold text-slate-400">Invoice Total:</span>
                        <span className="price text-sm font-bold font-mono text-[#1a1a2e]">₦{calculateCartTotal().toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Navigation buttons to continue shopping */}
                    <div className="flex gap-2 justify-center mt-1">
                      <button onClick={() => setCurrentRoom("showroom")} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1 border border-slate-700 transition-colors">
                        🛒 Browse to Showroom
                      </button>
                      <button onClick={() => setCurrentRoom("livesheet")} className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1 border border-blue-800 transition-colors">
                        📊 Browse to Price List
                      </button>
                    </div>

                    {invoiceStatus === "draft" ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col gap-3">
                        <p className="text-xs font-bold text-[#1a1a2e] uppercase mb-1">Customer Information</p>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name *</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-slate-50 rounded border border-slate-300 px-3 py-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="+234 801 234 5678"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-slate-50 rounded border border-slate-300 px-3 py-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email (Optional)</label>
                          <input
                            type="email"
                            placeholder="john.doe@email.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full bg-slate-50 rounded border border-slate-300 px-3 py-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8]"
                          />
                        </div>
                        <button
                          onClick={handleGenerateInvoice}
                          className="w-full py-3 mt-2 bg-[#1a73e8] hover:bg-[#2b85e4] text-white rounded font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FileText className="w-4 h-4" /> Generate Invoice
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center shadow-sm">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-emerald-800 font-bold text-sm">Your invoice has been sent to our Sales team.</p>
                        </div>
                        
                        <div className="bg-white border-2 border-[#1a1a2e] rounded shadow-md overflow-hidden font-mono text-[#1a1a2e] text-xs">
                          <div className="p-4 flex flex-col gap-1 text-center border-b-2 border-dashed border-[#1a1a2e] bg-slate-50">
                            <h2 className="font-bold text-base text-[#1a73e8] flex items-center justify-center gap-1"><span className="w-3 h-3 rounded-full bg-[#1a73e8] inline-block"></span> HITECH DISTRIBUTORS</h2>
                            <p>Computers · Office Equipment · Solar Sizing Hub</p>
                            <p>6 Airport Road, Warri · Delta State, Nigeria</p>
                          </div>
                          
                          <div className="p-4 flex flex-col gap-4">
                            <h3 className="text-center font-bold text-sm uppercase tracking-widest">Sales Invoice</h3>
                            
                            <div className="flex justify-between font-bold">
                              <span>Invoice #: {invoiceId}</span>
                              <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <p>Customer: {customerName}</p>
                              <p>Phone: {customerPhone}</p>
                              {customerEmail && <p>Email: {customerEmail}</p>}
                            </div>
                            
                            <div className="border-t-2 border-b-2 border-[#1a1a2e] py-2 mt-2">
                              <div className="grid grid-cols-12 gap-1 font-bold pb-2 border-b border-dashed border-[#1a1a2e]">
                                <div className="col-span-6">ITEM</div>
                                <div className="col-span-2 text-center">QTY</div>
                                <div className="col-span-4 text-right">TOTAL</div>
                              </div>
                              <div className="flex flex-col gap-2 pt-2">
                                {cart.map((item, i) => {
                                  const priceStr = getDisplayPrice(item.product);
                                  const priceNum = priceStr === "CALL" ? 0 : parseInt(priceStr.replace(/[^\d]/g, ""), 10);
                                  return (
                                    <div key={i} className="grid grid-cols-12 gap-1 items-start">
                                      <div className="col-span-6 break-words">{item.product.n}</div>
                                      <div className="col-span-2 text-center">{item.quantity}</div>
                                      <div className="col-span-4 text-right font-bold">₦{(priceNum * item.quantity).toLocaleString()}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 font-bold text-sm mt-2">
                              <div className="w-full max-w-[200px] flex justify-between">
                                <span>SUBTOTAL:</span>
                                <span>₦{calculateCartTotal().toLocaleString()}</span>
                              </div>
                              <div className="w-full max-w-[200px] flex justify-between text-lg text-[#1a73e8]">
                                <span>TOTAL DUE:</span>
                                <span>₦{calculateCartTotal().toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="border-t-2 border-[#1a1a2e] pt-3 mt-3 flex flex-col gap-1 text-[11px]">
                              <p className="font-bold">Payment Instructions:</p>
                              <p>Please transfer the total amount to {bankInfo}</p>
                              <p className="italic text-slate-600 mt-1">Send payment confirmation to Sales & Orders after transferring.</p>
                            </div>
                            
                            <div className="border-t border-dashed border-slate-300 pt-3 mt-1 text-center font-bold">
                              Thank you for choosing HiTech Distributors!
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setInvoiceStatus("draft");
                            setCart([]);
                            setCurrentRoom("showroom");
                          }}
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#1a1a2e] rounded border border-slate-300 font-bold uppercase tracking-wider text-xs transition-colors"
                        >
                          Start New Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Operational Desk Room */}
            {currentRoom === "operational" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Operational Desk! Find the right contact for your needs. Click any card to connect via WhatsApp or email. For escalations, submit a ticket and it will be routed to the right person." />
                
                {escSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-emerald-800 text-lg">Ticket Received</h3>
                    <p className="text-emerald-700 text-sm leading-relaxed">{escSuccess}</p>
                    <button onClick={() => {setEscSuccess(null); setShowEscalationForm(false);}} className="mt-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors">
                      OK
                    </button>
                  </div>
                ) : showEscalationForm ? (
                  <div className="bg-white rounded-xl border-2 border-[#1a2a4a] overflow-hidden shadow-md">
                    <div className="bg-[#1a2a4a] text-white p-3 flex justify-between items-center">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Escalation Request
                      </h3>
                      <button onClick={() => setShowEscalationForm(false)} className="text-white/70 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={submitEscalation} className="p-4 flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Full Name *</label>
                        <input required type="text" value={escName} onChange={(e) => setEscName(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Phone Number *</label>
                        <input required type="tel" value={escPhone} onChange={(e) => setEscPhone(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Email (Optional)</label>
                        <input type="email" value={escEmail} onChange={(e) => setEscEmail(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Order/Product Ref (Optional)</label>
                        <input type="text" value={escRef} onChange={(e) => setEscRef(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Urgency Level *</label>
                        <select value={escUrgency} onChange={(e) => setEscUrgency(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Issue Description *</label>
                        <textarea required rows={4} value={escDesc} onChange={(e) => setEscDesc(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] resize-none bg-white" />
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <button type="submit" disabled={submittingEsc} className="flex-1 py-2.5 bg-[#1a73e8] text-white font-bold uppercase tracking-wider text-xs rounded hover:bg-[#2b85e4] transition-colors flex items-center justify-center gap-1">
                          {submittingEsc ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Escalation</>}
                        </button>
                        <button type="button" onClick={() => setShowEscalationForm(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-xs rounded border border-slate-300 hover:bg-slate-200 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { title: "Front Desk & General Support", name: "Ese", num: "+2347032724432", email: "hitechdistributors@gmail.com", color: "bg-[#1a73e8]", icon: <Building className="w-5 h-5 text-white" /> },
                      { title: "Sales & Order Department", name: "Lucy", num: "09166241953", email: "hitechdistributors@gmail.com", color: "bg-[#34a853]", icon: <ShoppingCart className="w-5 h-5 text-white" /> },
                      { title: "Live Video Call Request", name: "Sophie", num: "+2348144824531", email: "hitechdistributors@gmail.com", color: "bg-[#9c27b0]", icon: <Video className="w-5 h-5 text-white" /> },
                      { title: "Repairs & Logistics Tracker", name: "Ruth", num: "+2348034832773", email: "hitechdistributors@gmail.com", color: "bg-[#fa7b17]", icon: <Wrench className="w-5 h-5 text-white" /> },
                      { title: "Pocket Store App Support", name: "Fortune", num: "+2349052127886", email: "hitechdistributors@gmail.com", color: "bg-[#009688]", icon: <Smartphone className="w-5 h-5 text-white" /> }
                    ].map((card, i) => (
                      <div key={i} className="flex flex-col bg-white border border-[#1a2a4a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className={`${card.color} p-2 flex items-center gap-2`}>
                          {card.icon}
                          <h4 className="font-bold text-white text-xs leading-tight">{card.title}</h4>
                        </div>
                        <div className="p-3 flex flex-col gap-1.5 flex-grow">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a1a2e]">
                            <User className="w-3.5 h-3.5 text-slate-400" /> {card.name}
                          </div>
                          <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                            <button onClick={() => window.open(`https://wa.me/${card.num.replace('+', '')}?text=Hello ${card.name}, I need assistance.`, '_blank')} className="flex-1 py-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-[10px] font-bold rounded flex justify-center items-center gap-1 transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </button>
                            <button onClick={() => window.location.href = `mailto:${card.email}`} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex justify-center items-center gap-1 transition-colors">
                              <Mail className="w-3.5 h-3.5" /> Email
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Escalation Card */}
                    <div className="flex flex-col bg-white border border-[#1a2a4a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                      <div className="bg-[#dc3545] p-2 flex items-center gap-2">
                        <Star className="w-5 h-5 text-white" />
                        <h4 className="font-bold text-white text-xs leading-tight">Submit Escalation Request</h4>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a1a2e]">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Ese
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">Fill out the escalation form to generate a priority ticket (MGR-XXX).</p>
                        <div className="mt-1 pt-2 border-t border-slate-100">
                          <button onClick={() => setShowEscalationForm(true)} className="w-full py-2 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#b91c1c] text-[10px] font-bold rounded flex justify-center items-center gap-1 uppercase tracking-wider transition-colors">
                            <FileText className="w-3.5 h-3.5" /> Open Escalation Form
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Diagnostics Desk Room (Repairs) */}
            {currentRoom === "repair" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Diagnostics Desk! Submit a repair request for your device. Fill in the form below, and our repairs team (Ruth) will contact you within 24 hours. You can track your repair status using your ticket number." />
                
                {/* Sub-view switches */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <button onClick={() => setTrackResult(null)} className={`py-1.5 text-xs font-bold rounded ${!trackResult ? "bg-slate-800 text-[var(--yl)]" : "text-slate-400"}`}>
                    Submit Request
                  </button>
                  <button onClick={() => setTrackResult(repairs[0] || null)} className={`py-1.5 text-xs font-bold rounded ${trackResult ? "bg-slate-800 text-[var(--yl)]" : "text-slate-400"}`}>
                    Track Repair
                  </button>
                </div>

                {repairSuccess && !trackResult ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-emerald-700 text-sm leading-relaxed">{repairSuccess}</p>
                    <button onClick={() => setRepairSuccess(null)} className="mt-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors">
                      OK
                    </button>
                  </div>
                ) : !trackResult ? (
                  <form onSubmit={submitRepairDesk} className="p-4 bg-white rounded-xl border border-[#1a2a4a] flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                      <Wrench className="w-5 h-5 text-[#1a73e8]" />
                      <h3 className="text-[#1a1a2e] font-bold text-base">Repair Ticket Form</h3>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Customer Name *</label>
                      <input required type="text" value={repairCustName} onChange={(e) => setRepairCustName(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Phone Number *</label>
                      <input required type="tel" value={repairCustPhone} onChange={(e) => setRepairCustPhone(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Email (Optional)</label>
                      <input type="email" value={repairCustEmail} onChange={(e) => setRepairCustEmail(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Product Name *</label>
                      <input required type="text" value={repairProductName} onChange={(e) => setRepairProductName(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Model/Serial Number *</label>
                      <input required type="text" value={repairModelSerial} onChange={(e) => setRepairModelSerial(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Fault Description *</label>
                      <textarea required rows={3} value={repairProblem} onChange={(e) => setRepairProblem(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] resize-none bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1a1a2e] uppercase mb-1 block">Preferred Pickup Method *</label>
                      <select value={repairMethod} onChange={(e) => setRepairMethod(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm text-[#1a1a2e] outline-none focus:border-[#1a73e8] bg-white">
                        <option value="In-Store">In-Store</option>
                        <option value="Drop-off">Drop-off</option>
                      </select>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button type="submit" disabled={submittingRepair} className="flex-1 py-2.5 bg-[#1a73e8] text-white font-bold uppercase tracking-wider text-xs rounded hover:bg-[#2b85e4] transition-colors flex items-center justify-center gap-1">
                        {submittingRepair ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Repair Request</>}
                      </button>
                      <button type="button" onClick={() => {
                        setRepairCustName("");
                        setRepairCustPhone("");
                        setRepairCustEmail("");
                        setRepairProductName("");
                        setRepairModelSerial("");
                        setRepairProblem("");
                        setRepairMethod("In-Store");
                      }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-xs rounded border border-slate-300 hover:bg-slate-200 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    <form onSubmit={handleTrackRepair} className="p-3 bg-white rounded-xl border border-[#1a2a4a] flex gap-2">
                      <input
                        type="text"
                        placeholder="Ticket Number, e.g. RPR-001"
                        value={trackRef}
                        onChange={(e) => setTrackRef(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-sm text-[#1a1a2e] rounded-lg p-2 flex-grow outline-none focus:border-[#1a73e8] font-mono"
                      />
                      <button type="submit" className="px-4 py-2 bg-[#1a73e8] hover:bg-[#2b85e4] text-xs text-white rounded-lg font-bold flex items-center gap-1">
                        <Search className="w-3.5 h-3.5" /> Check Status
                      </button>
                    </form>

                    {trackError && <p className="text-xs text-red-500 font-bold text-center">{trackError}</p>}

                    {trackResult && (
                      <div className="p-4 bg-white rounded-xl border border-[#1a2a4a] flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-[#1a1a2e] flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-[#1a73e8]" /> Ticket #: <span className="font-mono text-[#1a73e8]">{trackResult.ref}</span>
                          </h4>
                        </div>

                        <div className="text-sm text-[#1a1a2e] flex flex-col gap-1.5">
                          <p><strong>Product:</strong> {trackResult.productName}</p>
                          <p className="flex items-center gap-1 mt-2"><strong>Status:</strong> <span className="text-[#1a73e8] font-bold uppercase">● {trackResult.status}</span></p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded p-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timeline:</p>
                          <div className="flex flex-col gap-2 text-xs">
                            <div className="flex items-center gap-2 text-[#1a1a2e]"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {new Date(trackResult.submittedAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})} - Request Received</div>
                            <div className="flex items-center gap-2 text-[#1a1a2e]">
                              {["Under Review", "Being Repaired", "Ready for Collection", "Collected"].includes(trackResult.status) ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />} 
                              {["Under Review", "Being Repaired", "Ready for Collection", "Collected"].includes(trackResult.status) ? new Date(trackResult.submittedAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : "Pending"}: Under Review
                            </div>
                            <div className={`flex items-center gap-2 ${["Being Repaired", "Ready for Collection", "Collected"].includes(trackResult.status) ? "text-[#1a1a2e]" : "text-slate-500"}`}>
                              {["Being Repaired", "Ready for Collection", "Collected"].includes(trackResult.status) ? <span className="w-3.5 h-3.5 rounded-full bg-[#1a73e8] flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />} 
                              {["Being Repaired", "Ready for Collection", "Collected"].includes(trackResult.status) ? new Date(new Date(trackResult.submittedAt).getTime() + 86400000).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : "Pending"}: Being Repaired
                            </div>
                            <div className={`flex items-center gap-2 ${["Ready for Collection", "Collected"].includes(trackResult.status) ? "text-[#1a1a2e]" : "text-slate-500"}`}>
                              {["Ready for Collection", "Collected"].includes(trackResult.status) ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />} 
                              Pending: Ready for Collection
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-[#1a1a2e] italic">
                          <strong>Notes:</strong> {trackResult.problem}
                        </div>

                        <button onClick={() => window.open(`https://wa.me/2348034832773?text=Hello Ruth, I am checking on my repair ticket ${trackResult.ref}`, '_blank')} className="w-full py-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] text-[10px] font-bold rounded flex justify-center items-center gap-1 transition-colors mt-2">
                          <MessageCircle className="w-3.5 h-3.5" /> CONTACT RUTH
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Channels Room */}
            {currentRoom === "channels" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to Channels! Connect with HiTech Distributors on social media. Follow us for updates, promotions, and behind-the-scenes content." />
                <div className="p-4 rounded-xl bg-white border border-[#1a2a4a]">
                  <h3 className="font-bold text-base flex items-center gap-2 text-[#1a1a2e]">
                    <Network className="w-5 h-5 text-[#1a73e8]" /> Communication Channels
                  </h3>
                  <p className="text-xs text-black/60 mt-1">Connect with HiTech Distributors on our social media platforms and communication channels.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "WhatsApp Channel", subtitle: "+234 916 624 1953", action: "MESSAGE", link: "https://wa.me/2349166241953", icon: <MessageCircle className="w-6 h-6 text-[#25D366]" /> },
                    { title: "Facebook", subtitle: "facebook.com/hitechd", action: "VISIT", link: "https://facebook.com/hitechd", icon: <Facebook className="w-6 h-6 text-[#1877F2]" /> },
                    { title: "Instagram", subtitle: "@hitechdistributors", action: "VISIT", link: "https://instagram.com/hitechdistributors", icon: <Instagram className="w-6 h-6 text-[#E1306C]" /> },
                    { title: "TikTok", subtitle: "@hitechdistributors", action: "VISIT", link: "https://tiktok.com/@hitechdistributors", icon: <Video className="w-6 h-6 text-black" /> },
                    { title: "Website", subtitle: "www.hitechd.com", action: "VISIT", link: "https://www.hitechd.com", icon: <Globe className="w-6 h-6 text-[#1a73e8]" /> },
                    { title: "Status Downloader", subtitle: "Download WhatsApp Status", action: "OPEN", link: "#", icon: <Download className="w-6 h-6 text-[#1a1a2e]" /> }
                  ].map((chan, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#1a2a4a] flex flex-col justify-between min-h-[120px]">
                      <div>
                        <div className="flex gap-2 items-start mb-1">
                          {chan.icon}
                          <div className="flex flex-col">
                            <h4 className="font-bold text-xs text-[#1a1a2e] leading-tight">{chan.title}</h4>
                            <p className="text-[9px] text-black/60 leading-tight mt-0.5 break-words">{chan.subtitle}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(chan.link, chan.link === "#" ? "_self" : "_blank")}
                        className="w-full py-1.5 mt-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] text-[10px] font-bold rounded uppercase tracking-wider transition-colors"
                      >
                        [{chan.action}]
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Support Room (Info Booth) */}
            {currentRoom === "info" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 h-[calc(100vh-200px)]">
                <Teleprompter text="Welcome to AI Support! I'm here to help you navigate the app. Ask me anything about products, orders, or how to use the hublet. You can also access me from any room by clicking the floating 💬 button." />
                <div className="p-3 rounded-xl bg-slate-900 border border-[var(--border)] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-bold text-[var(--yl)]">Live Gemini Info Booth</h3>
                    <p className="text-[9px] text-[var(--mu)]">I know our entire computer and solar catalog!</p>
                  </div>
                </div>

                {/* Message display container */}
                <div className="flex-grow bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-y-auto flex flex-col gap-3 h-[300px]">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${msg.sender === "user" ? "bg-[var(--bl2)] text-white" : "bg-white text-[#1a1a2e] border border-slate-800"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-800 flex items-center gap-1 text-[10px] text-[#1a1a2e]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about laptop specs, solar combinations..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    className="flex-grow bg-slate-950 rounded-lg border border-slate-800 text-xs px-3 py-2.5 text-[var(--cr)] outline-none"
                  />
                  <button type="submit" disabled={chatLoading} className="p-2.5 bg-[var(--rd)] hover:bg-red-600 rounded-lg text-white">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Solar Hub Room */}
            {currentRoom === "solar" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                <Teleprompter text="Welcome to the Solar Hub! Explore our advanced hybrid backup installations, battery banks, and solar panel arrays." />
                <div className="p-6 bg-[#1a2a4a] border-4 border-[#1a2a4a] shadow-[8px_8px_0px_0px_rgba(26,42,74,1)]">
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter flex items-center gap-2 mb-2">
                    <Sun className="w-6 h-6 text-[#dc3545]" /> Solar Infrastructure
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Configure hybrid backup installations, batteries, panels, and chargers.</p>
                </div>

                <div className="p-6 bg-white border-4 border-[#1a2a4a] shadow-[8px_8px_0px_0px_rgba(26,42,74,1)]">
                  <h4 className="font-black text-sm text-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-black" /> AI Sizing Engine
                  </h4>
                  <p className="text-[11px] font-serif italic text-slate-700 mb-6">Input your daily appliances and average running hours, and the AI Core will automatically compute your ideal inverter, battery, and solar panel array.</p>

                  <div className="flex flex-col gap-3 bg-slate-100 p-4 border-2 border-[#1a2a4a]">
                    {sizingAppliances.map(app => (
                      <div key={app.id} className="flex justify-between items-center text-xs border-b border-dashed border-[#1a2a4a] pb-3 mb-1">
                        <div>
                          <p className="font-bold text-black uppercase">{app.name}</p>
                          <p className="text-[10px] text-slate-600 font-mono tracking-widest">{app.watts}W • {app.hours} hrs</p>
                        </div>
                        <div className="flex items-center bg-white border-2 border-[#1a2a4a] font-bold">
                          <button onClick={() => updateApplianceCount(app.id, -1)} className="p-1.5 text-black hover:bg-[#1a2a4a] hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="px-3 font-mono text-black">{app.count}</span>
                          <button onClick={() => updateApplianceCount(app.id, 1)} className="p-1.5 text-black hover:bg-[#1a2a4a] hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSizingRecommendation}
                      disabled={sizingLoading}
                      className="w-full py-3 mt-4 bg-[#1a2a4a] hover:bg-white hover:text-black border-2 border-[#1a2a4a] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      {sizingLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing Metrics...
                        </>
                      ) : (
                        "Generate Specifications"
                      )}
                    </button>
                  </div>
                </div>

                {sizingRecommendation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="p-6 bg-white border-4 border-[#1a2a4a] shadow-[8px_8px_0px_0px_rgba(26,42,74,1)] flex flex-col gap-4">
                    <h4 className="font-black text-xs text-black uppercase tracking-widest border-b-4 border-[#1a2a4a] pb-2">Deployment Specifications</h4>
                    <div className="text-xs font-mono text-black flex flex-col gap-2 bg-slate-100 border-2 border-[#1a2a4a] p-4">
                      <p><strong className="uppercase">Total Daily Load:</strong> {sizingRecommendation.totalLoadWh} Wh</p>
                      <div className="border-t border-dashed border-[#1a2a4a] my-2"></div>
                      <p className="text-black"><strong className="uppercase">Inverter Core:</strong> {sizingRecommendation.recommendedInverter?.name} ({sizingRecommendation.recommendedInverter?.price})</p>
                      <p className="text-black"><strong className="uppercase">Battery Storage:</strong> {sizingRecommendation.recommendedBattery?.name} ({sizingRecommendation.recommendedBattery?.price})</p>
                      <p className="text-black"><strong className="uppercase">Solar Array:</strong> {sizingRecommendation.recommendedPanels?.quantity}x {sizingRecommendation.recommendedPanels?.name} ({sizingRecommendation.recommendedPanels?.price} ea)</p>
                    </div>
                    <div className="text-[11px] text-slate-800 leading-relaxed font-serif italic border-l-4 border-[#1a2a4a] pl-3 my-2">
                      <p><strong>System Note:</strong> {sizingRecommendation.reasoning}</p>
                    </div>
                    <button
                      onClick={() => {
                        const message = `Hello, I ran the Solar Sizing tool. Recommended setup:\nInverter: ${sizingRecommendation.recommendedInverter?.name}\nBattery: ${sizingRecommendation.recommendedBattery?.name}\nPanels: ${sizingRecommendation.recommendedPanels?.quantity}x ${sizingRecommendation.recommendedPanels?.name}`;
                        window.open(`https://wa.me/${WA_SALES}?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                      className="w-full py-3 bg-[#1a2a4a] border-2 border-[#1a2a4a] text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      Transmit Order Directive
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* GM Contact Room */}
            {currentRoom === "contact" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the General Manager's Contact Desk. The GM is available for escalated issues only. Please submit an escalation request through the Operational Desk first. The GM will review your case and contact you if needed." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-[var(--yl)] font-bold text-base flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Escalated GM Contact
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Submit major contracts, bulk office requests, business partnerships, or escalated complaints directly to our General Manager queue.</p>
                </div>

                {!gmMsgSent ? (
                  <form onSubmit={submitGMContact} className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Inquiry Type</p>
                    <select
                      value={gmMsgType}
                      onChange={(e) => setGmMsgType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    >
                      <option value="Business Partnership/Distributorship">Business Partnership/Distributorship</option>
                      <option value="Large Corporate Order">Large Corporate Order</option>
                      <option value="Escalated Complaint">Escalated Complaint</option>
                      <option value="VIP Customer Enquiry">VIP Customer Enquiry</option>
                      <option value="Other Major Matter">Other Major Matter</option>
                    </select>

                    <textarea
                      placeholder="Type your message details here..."
                      value={gmMsgText}
                      onChange={(e) => setGmMsgText(e.target.value)}
                      rows={4}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono mt-2">Sender Info</p>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={gmCustName}
                      onChange={(e) => setGmCustName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />
                    <input
                      type="text"
                      placeholder="Contact WhatsApp Phone Number"
                      value={gmCustPhone}
                      onChange={(e) => setGmCustPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />
                    <input
                      type="text"
                      placeholder="Preferred call back time (e.g. Morning, Evening, Anytime)"
                      value={gmPrefTime}
                      onChange={(e) => setGmPrefTime(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <button
                      type="submit"
                      className="w-full py-3 bg-[var(--bl)] hover:bg-blue-600 rounded-lg text-xs font-bold text-white uppercase tracking-wider mt-2"
                    >
                      Submit Escalated Request
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-[var(--gr)] mb-3 animate-bounce" />
                    <h4 className="font-bold text-sm text-[var(--gr)] mb-1">Escalated Request Received</h4>
                    <p className="text-xs text-slate-400 px-6 max-w-sm mb-4">Your inquiry has been placed directly in the GM's queue. A staff manager will verify and contact you back at your preferred contact hour!</p>
                    <button onClick={() => setGmMsgSent(false)} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">
                      Send another request
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Client Feedback Room */}
            {currentRoom === "feedback" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to Client Feedback! We value your opinion. Please share your experience with us. Your feedback helps us improve our products and services." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-[var(--yl)] font-bold text-base flex items-center gap-2">
                    <Star className="w-5 h-5" /> Client Feedback & Reviews
                  </h3>
                  <p className="text-xs text-[var(--mu)]">We value high-fidelity service. Leave a review or check rating stars from other clients.</p>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                  <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Write a Review</p>
                  
                  <div className="flex gap-1.5 justify-center py-2 bg-slate-950 rounded-lg border border-slate-900">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setFeedRating(star)}>
                        <Star className={`w-6 h-6 ${feedRating >= star ? "text-[var(--yl)] fill-[var(--yl)]" : "text-slate-600"}`} />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Your Name"
                    value={feedName}
                    onChange={(e) => setFeedName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                  />
                  <textarea
                    placeholder="Describe your review comment here..."
                    value={feedComment}
                    onChange={(e) => setFeedComment(e.target.value)}
                    rows={3}
                    className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                  />

                  <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                    Submit client Review
                  </button>
                </form>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Recent Client Reviews</p>
                  {feedbacks.map(feed => (
                    <div key={feed.id} className="p-3 bg-[var(--dk2)] rounded-xl border border-[var(--border)] text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">{feed.name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${feed.rating >= star ? "text-[var(--yl)] fill-[var(--yl)]" : "text-slate-700"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed">"{feed.comment}"</p>
                      <span className="text-[9px] text-[var(--mu)] font-mono block mt-2">{new Date(feed.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pickup Scheduler Room */}
            {currentRoom === "pickup" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to Pickup Scheduler! Schedule a time to collect your order. Enter your Order Reference (ORD-XXX), select a date and time, and we'll confirm your pickup slot." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-blue-400 font-bold text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> In-Store Pickup Scheduler
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Schedule an exact pickup slot at our main office on 6 Airport Road, Warri, delta state.</p>
                </div>

                {!pickupBooked ? (
                  <form onSubmit={handlePickupSubmit} className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Booking Schedule</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none"
                      />
                      <select
                        value={pickupTimeSlot}
                        onChange={(e) => setPickupTimeSlot(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none"
                      >
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                        <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                        <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Describe Items to pick up"
                      value={pickupItems}
                      onChange={(e) => setPickupItems(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono mt-2">Client Info</p>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={pickupName}
                      onChange={(e) => setPickupName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />
                    <input
                      type="text"
                      placeholder="Your Phone Number"
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <button type="submit" className="w-full py-3 bg-[var(--bl)] hover:bg-blue-600 rounded-lg text-xs font-bold text-white uppercase tracking-wider mt-2">
                      Schedule Pickup Slot →
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-[var(--gr)] mb-3 animate-bounce" />
                    <h4 className="font-bold text-sm text-[var(--gr)] mb-1">Pickup Scheduled successfully</h4>
                    <p className="text-xs text-slate-400 px-6 max-w-sm mb-4">Your pickup slot is locked in. We will prepare your items for quick checkout before you arrive at 6 Airport Road.</p>
                    <button onClick={() => setPickupBooked(false)} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">
                      Schedule another slot
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Sheet Manager Room */}
            {currentRoom === "sheets" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Sheet Manager! Upload your Google Sheets CSV file here to populate the product catalogue. The data will automatically sync to the Display Floor, Showroom, and Price List. You can also edit rows directly in the table below. Tap any cell to edit." />
                
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-emerald-400 font-bold text-base flex items-center gap-2 mb-3">
                    <Database className="w-5 h-5" /> Sheet Manager (Room 16)
                  </h3>
                  
                  {/* CSV Upload Section */}
                  <div className="flex flex-col gap-3">
                    <textarea
                      rows={3}
                      placeholder="Paste CSV rows from Google Sheets (e.g. P/N,Category,Name,Spec,Price,Description,Promo,New)"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="border border-slate-800 text-xs rounded-lg p-2 outline-none font-mono text-[10px] w-full"
                      style={{ color: "#1a1a2e", backgroundColor: "#f8fafc" }}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleCsvImport} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
                         📤 UPLOAD GOOGLE SHEET
                      </button>
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700">
                         📥 DOWNLOAD TEMPLATE
                      </button>
                    </div>
                    {csvStatus && <p className="text-[10px] text-emerald-400 font-mono">{csvStatus}</p>}
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 mt-4">
                    <span className="text-xs text-[var(--cr)] font-bold">📊 {products.length} rows loaded</span>
                    <button className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1 hover:text-red-300">
                      <AlertTriangle className="w-3 h-3" /> CLEAR LOADED DATA
                    </button>
                  </div>
                </div>

                <PresetSelector />

                {/* Actions & Search */}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="🔍 Search full spreadsheet data..."
                    value={sheetSearch}
                    onChange={(e) => setSheetSearch(e.target.value)}
                    className="w-full border border-slate-800 text-xs rounded-lg p-3 outline-none"
                    style={{ color: "#1a1a2e", backgroundColor: "#f8fafc" }}
                  />
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-slate-800 rounded border border-slate-700 text-[10px] font-bold text-white uppercase tracking-wider">
                      + ADD NEW ROW
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      ✔ SAVE & SYNC LIVE STORE
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-slate-900 rounded border border-slate-800 text-[9px] font-mono text-slate-400 uppercase">
                      📋 EXPORT EXCEL (.XLSX)
                    </button>
                    <button className="flex-1 py-2 bg-slate-900 rounded border border-slate-800 text-[9px] font-mono text-slate-400 uppercase">
                      📋 EXPORT CSV (.CSV)
                    </button>
                  </div>
                </div>

                {/* Display Floor Selection Panel */}
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)] mb-4">
                  <h3 className="text-[var(--yl)] font-bold text-sm flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                    🏪 DISPLAY FLOOR SELECTION
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <p className="text-sm font-bold text-white mb-1">
                        Selected Products: {displayFloorSelection.length} out of 155
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          const conf = { selection: displayFloorSelection };
                          try {
                            localStorage.setItem("ht_display_floor_config", JSON.stringify(displayFloorSelection));
                            setCsvStatus("✅ Display Floor Selection Saved!");
                            setTimeout(() => setCsvStatus(""), 3000);
                          } catch (e) {
                            console.error("Failed to save display floor config", e);
                          }
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        💾 SAVE SELECTION
                      </button>
                      <button 
                        onClick={() => {
                          setDisplayFloorSelection(Array.from({ length: 25 }, (_, i) => String(131 + i)));
                        }}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        🔄 RESET TO DEFAULT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-slate-900 rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[2500px]">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[9px] uppercase tracking-wider text-[var(--mu)]">
                          <th className="p-3 font-medium">Selection</th>
                          <th className="p-3 font-medium">No.</th>
                          <th className="p-3 font-medium">Brand</th>
                          <th className="p-3 font-medium">Product Code</th>
                          <th className="p-3 font-medium">Category</th>
                          <th className="p-3 font-medium">Description Headline</th>
                          <th className="p-3 font-medium">Description Bullets</th>
                          <th className="p-3 font-medium">Technical Specs</th>
                          <th className="p-3 font-medium">Price</th>
                          <th className="p-3 font-medium">Assurance Layer</th>
                          <th className="p-3 font-medium">Assurance Text</th>
                          <th className="p-3 font-medium">Laggard Layer</th>
                          <th className="p-3 font-medium">Laggard Promo Text</th>
                          <th className="p-3 font-medium">Image URL</th>
                          <th className="p-3 font-medium">Front Image</th>
                          <th className="p-3 font-medium">Side Image</th>
                          <th className="p-3 font-medium">Back Image</th>
                          <th className="p-3 font-medium">Top Image</th>
                          <th className="p-3 font-medium">Video</th>
                          <th className="p-3 font-medium">Stock Status</th>
                          <th className="p-3 font-medium">Staff Notes</th>
                          <th className="p-3 font-medium">Search Keywords</th>
                          <th className="p-3 font-medium">Color/Variant</th>
                          <th className="p-3 font-medium">Needs Verification</th>
                          <th className="p-3 font-medium">Floor Display</th>
                          <th className="p-3 font-medium sticky right-0 bg-slate-950">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-slate-300">
                        {products.filter(p => !sheetSearch || p.n.toLowerCase().includes(sheetSearch.toLowerCase()) || p.pn?.toLowerCase().includes(sheetSearch.toLowerCase())).map((p, index) => {
                          const rowNum = String(p.displayOrder || index + 1);
                          const isSelected = displayFloorSelection.includes(rowNum);

                          return (
                            <tr key={p.id} onClick={() => setEditingProduct(p)} className="border-b border-slate-800/50 hover:bg-slate-800/30 group cursor-pointer">
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded transition-colors">
                                  <input 
                                    type="checkbox"
                                    className="accent-blue-500 w-4 h-4"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setDisplayFloorSelection(prev => [...prev, rowNum]);
                                      } else {
                                        setDisplayFloorSelection(prev => prev.filter(r => r !== rowNum));
                                      }
                                    }}
                                  />
                                  <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>SHOW</span>
                                </label>
                              </td>
                              <td className="p-3 font-mono">{rowNum}</td>
                            <td className="p-3">{p.brand}</td>
                            <td className="p-3 font-mono text-[var(--yl)]">{p.pn || "—"}</td>
                            <td className="p-3">{p.cat}</td>
                            <td className="p-3 truncate max-w-[150px]">{p.desc}</td>
                            <td className="p-3 truncate max-w-[150px]">{p.bullets}</td>
                            <td className="p-3 truncate max-w-[150px]">{p.sp}</td>
                            <td className="price p-3">{p.price}</td>
                            <td className="p-3">{p.assuranceLayer}</td>
                            <td className="p-3 truncate max-w-[100px]">{p.assuranceText}</td>
                            <td className="p-3">{p.laggardLayer}</td>
                            <td className="p-3 truncate max-w-[100px]">{p.laggardPromoText}</td>
                            <td className="p-3 truncate max-w-[100px]">{p.imgManual}</td>
                            <td className="p-3">{p.imgFront}</td>
                            <td className="p-3">{p.imgSide}</td>
                            <td className="p-3">{p.imgBack}</td>
                            <td className="p-3">{p.imgTop}</td>
                            <td className="p-3">{p.imgVideo}</td>
                            <td className="p-3">{p.stock}</td>
                            <td className="p-3 truncate max-w-[100px]">{p.staffNotes}</td>
                            <td className="p-3 truncate max-w-[100px]">{p.searchKeywords}</td>
                            <td className="p-3">{p.color}</td>
                            <td className="p-3">{p.needsVerification}</td>
                            <td className="p-3">{p.floorDisplay}</td>
                            <td className="p-3 flex gap-2 sticky right-0 bg-slate-900 group-hover:bg-slate-800/80">
                              <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-blue-400" title="Edit Row">
                                📝
                              </button>
                              <button onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-red-400" title="Delete Row">
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-slate-950/50 flex flex-col gap-1 border-t border-slate-800">
                    <p className="text-[9px] text-[var(--mu)] flex items-center gap-1.5">💡 Tap the 📝 icon to edit a row</p>
                    <p className="text-[9px] text-[var(--mu)] flex items-center gap-1.5">💡 Tap any cell to edit</p>
                    <p className="text-[9px] text-[var(--mu)] flex items-center gap-1.5">💡 Swipe left on a row for quick actions</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Modal for editing product */}
            {editingProduct && (
              <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-[#1a2a4a]/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      ✏️ Edit Product <span className="text-[10px] text-slate-500 font-mono">(Row {products.findIndex(p => p.id === editingProduct.id) + 1})</span>
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-grow">
                    {[
                      { label: "No.", val: products.findIndex(p => p.id === editingProduct.id) + 1 },
                      { label: "Brand", val: editingProduct.n.split(" ")[0] },
                      { label: "Product Code", val: editingProduct.pn || "" },
                      { label: "Category", val: editingProduct.cat },
                      { label: "Description", val: editingProduct.desc },
                      { label: "Bullets", val: "• High Performance" },
                      { label: "Technical Specs", val: editingProduct.sp },
                      { label: "Price (₦)", val: editingProduct.price },
                      { label: "Stock Status", val: "In Stock" },
                      { label: "Floor Display", val: "Yes" },
                    ].map((field, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">{field.label}</label>
                        <input
                          type="text"
                          defaultValue={field.val}
                          className="w-full border border-slate-800 text-xs rounded-lg p-2.5 outline-none font-mono"
                          style={{ color: "#1a1a2e", backgroundColor: "#f8fafc" }}
                        />
                      </div>
                    ))}
                    
                    <div className="mt-2 border-t border-slate-800 pt-3">
                      <h4 className="text-[10px] text-[var(--mu)] uppercase tracking-wider mb-2">Media Assets</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {["Front Image", "Side Image", "Back Image", "Top Image"].map(img => (
                          <div key={img} className="bg-slate-950 border border-slate-800 rounded flex justify-between items-center p-2">
                            <span className="text-[9px] text-slate-400">{img}</span>
                            <button className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1"><Upload className="w-3 h-3"/> Upload</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-2">
                    <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 bg-[var(--bl)] hover:bg-blue-600 rounded text-xs font-bold text-white uppercase tracking-wider">
                      💾 SAVE CHANGES
                    </button>
                    <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-slate-300 uppercase tracking-wider">
                      ❌ CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shadow School Room */}
            {currentRoom === "school" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 text-left">
                <Teleprompter text="Welcome to the HiTech Shadow School! We train youths on digital marketing, computer repairs, solar solutions, and entrepreneurship. Apply now to join the next cohort and build your future." />
                
                {/* About Section */}
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)] flex flex-col gap-3">
                  <h3 className="text-emerald-400 font-bold text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" /> 🎯 ABOUT THE SHADOW SCHOOL
                  </h3>
                  <p className="text-xs text-[var(--mu)] leading-relaxed">
                    The HiTech Shadow School is a hands-on training program designed to equip youths with practical skills in:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 my-1">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400 text-lg">🔧</span> Computer Repairs
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400 text-lg">📈</span> Digital Marketing
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400 text-lg">☀️</span> Solar Repairs
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400 text-lg">💡</span> Entrepreneurship
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 mt-1 flex flex-col gap-2 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">📍 Location:</span>
                      <span className="text-slate-200">HiTech Distributors Showroom, Warri</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">⏳ Duration:</span>
                      <span className="text-slate-200">3 Months (Intensive Training)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">👥 Cohort Size:</span>
                      <span className="text-emerald-400">Limited slots available</span>
                    </div>
                  </div>
                </div>

                {/* Application Form */}
                <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                    <span className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-bold">📝 APPLICATION FORM</span>
                  </div>

                  {schSuccess ? (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 text-center flex flex-col items-center gap-2 my-2">
                      <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                      <p className="font-bold">{schSuccess}</p>
                      <button 
                        onClick={() => setSchSuccess(null)}
                        className="mt-2 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-[10px] font-bold rounded uppercase text-white transition-colors"
                      >
                        Submit another application
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleShadowSchoolSubmit} className="flex flex-col gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={schName}
                          onChange={(e) => setSchName(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 0703 272 4432"
                            value={schPhone}
                            onChange={(e) => setSchPhone(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Age *</label>
                          <input
                            type="number"
                            required
                            min="10"
                            max="120"
                            placeholder="Your Age"
                            value={schAge}
                            onChange={(e) => setSchAge(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={schEmail}
                          onChange={(e) => setSchEmail(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Program of Interest *</label>
                        <div className="relative">
                          <select
                            required
                            value={schProgram}
                            onChange={(e) => setSchProgram(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500 cursor-pointer appearance-none"
                          >
                            <option value="Computer Repairs">🔧 Computer Repairs</option>
                            <option value="Digital Marketing">📈 Digital Marketing</option>
                            <option value="Solar Repairs">☀️ Solar Repairs</option>
                            <option value="Entrepreneurship">💡 Entrepreneurship</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                            ▼
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Why do you want to join? *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Briefly state your purpose or reasons for joining..."
                          value={schReason}
                          onChange={(e) => setSchReason(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full focus:border-emerald-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingSch}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-800 disabled:to-emerald-700 rounded-lg text-xs font-bold text-white uppercase tracking-wider mt-2 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                      >
                        {submittingSch ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            SUBMITTING APPLICATION...
                          </>
                        ) : (
                          "SUBMIT APPLICATION"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {/* Staff Room Room */}
            {currentRoom === "staff" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Staff Room! This is your control center. Manage the Display Floor layout, configure presets, and update product data. Only authorized staff have access." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-red-500 font-bold text-base flex items-center gap-2">
                    <Lock className="w-5 h-5" /> Staff Corner Portal
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Private access terminal for company operators. Sync sheet CSV files, toggle availability, and check repair queues.</p>
                </div>

                {!staffIsLoggedIn ? (
                  <form onSubmit={handleStaffLogin} className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Authentication PIN</p>
                    <input
                      type="password"
                      placeholder="Enter 5-digit Staff PIN"
                      value={staffPIN}
                      onChange={(e) => setStaffPIN(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-3 outline-none text-center font-mono tracking-widest text-lg"
                    />
                    {staffError && <p className="text-xs text-red-500 font-mono text-center">{staffError}</p>}
                    <button type="submit" className="w-full py-3 bg-[var(--bl)] hover:bg-blue-600 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      Unlock Portal →
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-1">Hint: Try standard PIN 12345 or Key qw123#@</p>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Logged in tools */}
                    <div className="p-3 bg-slate-900 border border-[var(--border)] rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300 font-mono">Welcome Operational Team</span>
                      <button onClick={() => setStaffIsLoggedIn(false)} className="px-2.5 py-1.5 bg-red-950/40 text-red-400 border border-red-900/60 rounded text-[10px] font-bold uppercase">
                        Log out
                      </button>
                    </div>

                    {/* Dynamic Preset Switch */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)]">
                      <h4 className="font-bold text-xs text-[var(--yl)] uppercase mb-2">Preset Adjuster</h4>
                      <div className="flex flex-col gap-2">
                        {["DEFAULT", "PROMO HIGH", "SEASONAL DEALS", "WORKBOOK DISPLAY", "LAST IMPORTED SHEET"].map(preset => (
                          <button
                            key={preset}
                            onClick={() => { setCurrentPreset(preset as any); }}
                            className={`py-2 px-3 text-xs text-left rounded-lg font-mono border ${currentPreset === preset ? "bg-[var(--yl)] text-slate-950 border-amber-500 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggle availability */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Manager Availability</h4>
                        <p className="text-[10px] text-[var(--mu)]">Toggle physical availability status</p>
                      </div>
                      <button
                        onClick={() => setManagerAvailable(!managerAvailable)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg ${managerAvailable ? "bg-[var(--gr)] text-white" : "bg-red-600 text-white animate-pulse"}`}
                      >
                        {managerAvailable ? "Available In-Store" : "Busy"}
                      </button>
                    </div>

                    {/* Bank account details editor */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Edit bank details</h4>
                      <input
                        type="text"
                        value={bankInfo}
                        onChange={(e) => { setBankInfo(e.target.value); localStorage.setItem("ht_bank_info", e.target.value); }}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 outline-none font-mono"
                      />
                    </div>

                    {/* Starting Page Photo Customizer */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-blue-950/60 rounded border border-blue-800/50">
                          <svg className="w-4 h-4 text-[var(--yl)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Starting Page Photo Manager</h4>
                      </div>
                      <p className="text-[10px] text-[var(--mu)]">Customize the primary storefront banner displayed on the landing page.</p>

                      {/* Current Image Preview & Input */}
                      <div className="flex gap-3 items-center border border-slate-800 p-2.5 rounded-lg bg-slate-950/50">
                        <img 
                          src={storefrontImage} 
                          alt="Thumbnail" 
                          className="w-16 h-12 object-cover rounded border border-slate-800 bg-slate-900 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
                          }}
                        />
                        <div className="flex-grow flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-[var(--mu)] uppercase">Image Source URL</span>
                          <input
                            type="text"
                            value={storefrontImage}
                            onChange={(e) => {
                              setStorefrontImage(e.target.value);
                            }}
                            onBlur={async (e) => {
                              setUploadStatus("📤 Saving custom URL...");
                              try {
                                await db.saveStorefrontBanner(e.target.value);
                                setUploadStatus("✅ Saved! Custom URL is now the active banner.");
                              } catch (err) {
                                setUploadStatus("❌ Failed to save custom URL");
                              }
                            }}
                            placeholder="Paste image URL here..."
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] text-[var(--cr)] rounded p-1.5 outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Presets Grid */}
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[var(--mu)] uppercase">Banner Slots (Click to activate, icon to replace):</span>
                          {uploadStatus && (
                            <span className={`text-[9px] font-mono truncate max-w-[200px] ${uploadStatus.toLowerCase().includes("error") ? "text-red-400" : "text-emerald-400"}`}>
                              {uploadStatus}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {[
                            { id: "hitech_preset_1", label: "Slot 1" },
                            { id: "hitech_preset_2", label: "Slot 2" },
                            { id: "hitech_preset_3", label: "Slot 3" }
                          ].map(preset => {
                            const imgUrl = presets[preset.id];
                            const isActive = storefrontImage === imgUrl;
                            return (
                              <div key={preset.id} className={`relative flex flex-col rounded border overflow-hidden bg-slate-950 ${isActive ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "border-slate-800"}`}>
                                <div 
                                  className="h-20 w-full relative cursor-pointer group"
                                  onClick={async () => {
                                    setStorefrontImage(imgUrl);
                                    localStorage.setItem("ht_storefront_image", imgUrl);
                                    setUploadStatus(`📤 Activating ${preset.label}...`);
                                    try {
                                      await db.saveStorefrontBanner(imgUrl);
                                      setUploadStatus(`✅ Saved! ${preset.label} is active.`);
                                    } catch (e) {
                                      setUploadStatus("❌ Failed to activate");
                                    }
                                  }}
                                >
                                  <img src={imgUrl} alt={preset.label} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{isActive ? "Active" : "Set Active"}</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900/50 p-1.5 flex justify-between items-center border-t border-slate-800">
                                  <span className={`text-[9px] font-mono truncate ${isActive ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                                    {preset.label}
                                  </span>
                                  <label className={`cursor-pointer px-2 py-1 flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`} title="Upload new photo for this slot">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-[9px] uppercase font-bold tracking-wider">Replace</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePresetUpload(preset.id)} />
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Google Sheet CSV Import Form */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Load Product Catalog via CSV</h4>
                      <p className="text-[10px] text-[var(--mu)]">Paste rows exported from your Google Sheet workbook.</p>
                      <textarea
                        rows={4}
                        placeholder="P/N,Category,Name,Spec,Price,Description,Promo,New&#10;9B4P0EA,laptops,HP ProBook,Core Ultra,₦1150000,Premium device,false,true"
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 outline-none font-mono text-[10px] w-full"
                      />
                      <button onClick={handleCsvImport} className="w-full py-2 bg-[var(--bl)] hover:bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider">
                        Import CSV Sheet Catalog
                      </button>
                      {csvStatus && <p className="text-[10px] text-emerald-400 font-mono text-center">{csvStatus}</p>}
                    </div>

                    {/* Action Feedback Banner */}
                    {staffActionStatus && (
                      <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono text-center flex items-center justify-between gap-2">
                        <span>{staffActionStatus}</span>
                        <button onClick={() => setStaffActionStatus(null)} className="text-emerald-400 hover:text-white font-bold px-1 text-[11px]">✕</button>
                      </div>
                    )}

                    {/* Receipt Generation Form */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <h4 className="font-bold text-[13px] text-white uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" /> ISSUE RECEIPT
                      </h4>
                      {!showReceipt ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Receipt Number (Optional)</label>
                              <input type="text" placeholder="Leave blank to auto-generate" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Customer Name *</label>
                              <input type="text" value={rcpCustomerName} onChange={e => setRcpCustomerName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Phone Number *</label>
                              <input type="tel" value={rcpCustomerPhone} onChange={e => setRcpCustomerPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Email</label>
                              <input type="email" value={rcpCustomerEmail} onChange={e => setRcpCustomerEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Invoice Number *</label>
                              <input type="text" value={rcpInvoiceNum} onChange={e => setRcpInvoiceNum(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Amount Paid (₦) *</label>
                              <input type="number" value={rcpAmount} onChange={e => setRcpAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Payment Method *</label>
                              <select value={rcpMethod} onChange={e => setRcpMethod(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono">
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="POS">POS</option>
                                <option value="USSD">USSD</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Payment Date *</label>
                              <input type="date" value={rcpDate} onChange={e => setRcpDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Transaction Ref</label>
                              <input type="text" value={rcpRef} onChange={e => setRcpRef(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">What Was Paid For *</label>
                              <textarea rows={2} value={rcpPaidFor} onChange={e => setRcpPaidFor(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Balance Remaining (₦)</label>
                              <input type="number" value={rcpBalance} onChange={e => setRcpBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-[var(--mu)] tracking-widest mb-1 block">Issued By *</label>
                              <select value={rcpIssuedBy} onChange={e => setRcpIssuedBy(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono">
                                <option value="Lucy">Lucy</option>
                                <option value="Ruth">Ruth</option>
                                <option value="Sophie">Sophie</option>
                                <option value="Ese">Ese</option>
                              </select>
                            </div>
                          </div>
                          <button onClick={() => setShowReceipt(true)} className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold uppercase tracking-wider text-xs transition-colors shadow-sm">
                            Generate Receipt
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="bg-white border-2 border-[#1a1a2e] rounded shadow-md overflow-hidden font-mono text-[#1a1a2e] text-xs">
                            <div className="p-4 flex flex-col gap-1 text-center border-b-2 border-dashed border-[#1a1a2e] bg-[#f0f9f0]">
                              <h2 className="font-bold text-base text-emerald-600 flex items-center justify-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> HITECH DISTRIBUTORS</h2>
                              <p>Computers · Office Equipment · Solar Sizing Hub</p>
                              <p>6 Airport Road, Warri · Delta State, Nigeria</p>
                              <p>📞 +234 803 217 5552  |  ✉️ hitechdistributors@gmail.com</p>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-4">
                              <h3 className="text-center font-bold text-sm uppercase tracking-widest bg-emerald-100 text-emerald-800 py-1 rounded">OFFICIAL RECEIPT</h3>
                              
                              <div className="flex justify-between font-bold">
                                <span>Receipt #: {receiptNumber || `RCP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`}</span>
                                <span>Date: {rcpDate.split('-').reverse().join('/')}</span>
                              </div>
                              <div className="font-bold text-right text-[10px] text-slate-500 mt-[-12px]">Issued By: {rcpIssuedBy}</div>
                              
                              <div className="border-t-2 border-b-2 border-[#1a1a2e] py-3 mt-1 flex flex-col gap-1">
                                <p className="font-bold text-sm mb-1 uppercase text-slate-500">👤 Customer Information</p>
                                <p>Full Name: <span className="font-bold">{rcpCustomerName}</span></p>
                                <p>Phone: {rcpCustomerPhone}</p>
                                {rcpCustomerEmail && <p>Email: {rcpCustomerEmail}</p>}
                                <p>Invoice Number: {rcpInvoiceNum}</p>
                              </div>
                              
                              <div className="flex flex-col gap-1 border-b-2 border-[#1a1a2e] pb-3">
                                <p className="font-bold text-sm mb-1 uppercase text-slate-500">💰 Payment Details</p>
                                <p>Amount Paid: <span className="font-bold text-base">₦{Number(rcpAmount).toLocaleString()}</span></p>
                                <p>Payment Method: {rcpMethod}</p>
                                <p>Payment Date: {rcpDate.split('-').reverse().join('/')}</p>
                                <p>Payment Status: <span className="text-emerald-600 font-bold">✅ CONFIRMED</span></p>
                              </div>

                              <div className="flex flex-col gap-1 border-b-2 border-[#1a1a2e] pb-3">
                                <p className="font-bold text-sm mb-1 uppercase text-slate-500">🏦 Receiving Account</p>
                                <p>Bank Name: <span className="font-bold">GTBank</span></p>
                                <p>Account Name: <span className="font-bold">HiTech Distributors</span></p>
                                <p>Account Number: <span className="font-bold">1234567890</span></p>
                                {rcpRef && <p>Transaction Ref: {rcpRef}</p>}
                              </div>
                              
                              <div className="flex flex-col gap-1 border-b-2 border-[#1a1a2e] pb-3">
                                <p className="font-bold text-sm mb-1 uppercase text-slate-500">🛒 What Was Paid For</p>
                                <p className="whitespace-pre-wrap">{rcpPaidFor}</p>
                              </div>

                              <div className="flex flex-col items-end gap-1 font-bold text-sm">
                                <div className="w-full max-w-[250px] flex justify-between">
                                  <span>TOTAL AMOUNT DUE:</span>
                                  <span>₦{(Number(rcpAmount) + Number(rcpBalance)).toLocaleString()}</span>
                                </div>
                                <div className="w-full max-w-[250px] flex justify-between">
                                  <span>AMOUNT PAID:</span>
                                  <span>₦{Number(rcpAmount).toLocaleString()}</span>
                                </div>
                                <div className={`w-full max-w-[250px] flex justify-between ${Number(rcpBalance) > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                  <span>BALANCE REMAINING:</span>
                                  <span>₦{Number(rcpBalance).toLocaleString()} {Number(rcpBalance) <= 0 && "✅ PAID IN FULL"}</span>
                                </div>
                              </div>
                              
                              <div className="border-t-2 border-[#1a1a2e] pt-3 mt-3 flex flex-col gap-1 text-[11px]">
                                <p className="font-bold text-sm mb-1 uppercase text-slate-500">📞 CONTACT US</p>
                                <div className="grid grid-cols-2 gap-1 mb-2">
                                  <p>🏢 Front Desk: +234 703 272 4432</p>
                                  <p>💰 Sales & Orders: 09166241953</p>
                                  <p>🛒 Sales Rep: +234 814 482 4531</p>
                                  <p>🔧 Repairs: +234 803 483 2773</p>
                                  <p>⭐ General Manager: +234 803 217 5552</p>
                                  <p>✉️ Email: hitechd@hitechd.com</p>
                                </div>
                                <p className="font-bold italic text-center border-t border-slate-300 pt-3">✅ This receipt confirms that the above payment has been received and verified by HiTech Distributors.</p>
                                <p className="font-bold mt-2 text-center">🙏 Thank you for your business, {rcpCustomerName.split(' ')[0]}!</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm border border-slate-700">
                                📄 Download / Print PDF
                              </button>
                              <button onClick={() => {
                                const waText = `Hello ${rcpCustomerName},\n\nThank you for your payment of ₦${Number(rcpAmount).toLocaleString()} to HiTech Distributors.\n\nYour official receipt ${receiptNumber || 'RCP-XXX'} is ready.\n\nThank you for choosing HiTech Distributors!`;
                                window.open(`https://wa.me/${rcpCustomerPhone.replace(/\+/g, '')}?text=${encodeURIComponent(waText)}`, '_blank');
                              }} className="flex-1 py-2 bg-[#25D366] hover:bg-[#1da851] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                <MessageCircle className="w-4 h-4" /> Send WhatsApp
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                const mailTo = `mailto:hitechdistributors@gmail.com,hitechd@hitechd.com?subject=New Receipt Issued: ${rcpCustomerName}&body=A new receipt has been issued.%0A%0ACustomer: ${rcpCustomerName}%0AAmount: N${Number(rcpAmount).toLocaleString()}%0APayment Method: ${rcpMethod}%0AInvoice: ${rcpInvoiceNum}`;
                                window.location.href = mailTo;
                              }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                <Mail className="w-4 h-4" /> Send Emails
                              </button>
                              <button onClick={() => setShowReceipt(false)} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-800">
                                Create Another
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GM queue list */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <h4 className="font-bold text-xs text-[var(--yl)] uppercase border-b border-slate-800 pb-2">GM Request queue ({gmRequests.length})</h4>
                      {gmRequests.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-mono text-center py-4">No escalated requests logged.</p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {gmRequests.map(req => (
                            <div key={req.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                              <p className="font-bold text-[var(--yl)] mb-1">{req.type}</p>
                              <p className="text-slate-300">"{req.message}"</p>
                              <p className="text-[10px] text-slate-500 mt-2">By: {req.name} ({req.phone})</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Real-time Invoice & Order desk */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Invoices & Orders Ledger ({orders.length})</h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Cloud Synchronized</span>
                      </div>
                      {orders.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-mono text-center py-4">No invoices have been generated yet.</p>
                      ) : (
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {orders.map(order => {
                            let itemsParsed = [];
                            try {
                              itemsParsed = JSON.parse(order.items || "[]");
                            } catch(e) {}
                            return (
                              <div key={order.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-blue-400">#{order.id}</span>
                                    <p className="text-[9px] text-slate-500">{new Date(order.timestamp).toLocaleString()}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    order.status === "Pending Payment" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                                    order.status === "Paid & Awaiting Processing" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                                    order.status === "Processed & Ready" ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" :
                                    "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                                  }`}>
                                    {order.status || "Pending Payment"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-300">
                                  <p><span className="text-slate-500">Customer:</span> {order.customerName} ({order.phone})</p>
                                  <p><span className="text-slate-500">Amount:</span> ₦{Number(order.total).toLocaleString()}</p>
                                  {itemsParsed.length > 0 && (
                                    <div className="mt-1 pl-2 border-l border-slate-800 text-[10px] text-slate-400 flex flex-col gap-0.5">
                                      {itemsParsed.map((it: any, i: number) => (
                                        <p key={i}>• {it.name} (x{it.quantity})</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {order.receiptUrl && (
                                  <div className="mt-1">
                                    <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline text-[10px] flex items-center gap-1">
                                      📎 View Customer Proof of Payment Receipt
                                    </a>
                                  </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-1.5 items-center justify-between border-t border-slate-900 pt-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-500">Status:</span>
                                    <select 
                                      value={order.status || "Pending Payment"}
                                      onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        try {
                                          await db.updateInvoiceStatus(order.db_id, newStatus);
                                          setStaffActionStatus(`Status updated for #${order.id}!`);
                                          setTimeout(() => setStaffActionStatus(null), 3000);
                                        } catch (err) {
                                          console.error("Failed to update status:", err);
                                        }
                                      }}
                                      className="bg-slate-900 text-[10px] text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 outline-none font-mono cursor-pointer"
                                    >
                                      <option value="Pending Payment">Pending Payment</option>
                                      <option value="Paid & Awaiting Processing">Paid & Awaiting Processing</option>
                                      <option value="Processed & Ready">Processed & Ready</option>
                                      <option value="Dispatched/Completed">Dispatched/Completed</option>
                                    </select>
                                  </div>
                                  {!order.paid && order.status !== "Paid & Awaiting Processing" && (
                                    <button
                                      onClick={async () => {
                                        const rcpNum = "RCP-" + Math.floor(100000 + Math.random() * 900000);
                                        const rcpPayload = {
                                          id: rcpNum,
                                          orderId: order.id,
                                          customerName: order.customerName,
                                          total: order.total,
                                          timestamp: new Date().toISOString()
                                        };
                                        try {
                                          await db.updateInvoiceStatus(order.db_id, "Paid & Awaiting Processing");
                                          
                                          const localReceipts = JSON.parse(localStorage.getItem("ht_receipts") || "[]");
                                          localReceipts.push(rcpPayload);
                                          localStorage.setItem("ht_receipts", JSON.stringify(localReceipts));
                                          
                                          setStaffActionStatus(`Issued Official Receipt ${rcpNum}!`);
                                          setTimeout(() => setStaffActionStatus(null), 4000);
                                        } catch (err) {
                                          console.error("Failed to issue receipt:", err);
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded text-[9px] uppercase font-bold cursor-pointer"
                                    >
                                      Issue Official Receipt
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Official Receipts Issued */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Official Receipts Issued ({receipts.length})</h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Live Log</span>
                      </div>
                      {receipts.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-mono text-center py-4">No receipts have been issued yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                          {receipts.map(rcp => (
                            <div key={rcp.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-400">{rcp.id}</span>
                                <span className="text-[9px] text-slate-500">{new Date(rcp.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-slate-300">Order Ref: <span className="text-blue-400">#{rcp.orderId}</span></p>
                              <p className="text-slate-300">Customer: {rcp.customerName}</p>
                              <p className="text-slate-300 font-bold">Amount Paid: ₦{Number(rcp.total).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Escalation Tickets */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <h4 className="font-bold text-xs text-[var(--yl)] uppercase border-b border-slate-800 pb-2">Escalation tickets (MGR-XXX) ({escalations.length})</h4>
                      {escalations.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-mono text-center py-4">No escalated tickets logged.</p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {escalations.map(esc => (
                            <div key={esc.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-red-400">{esc.id} [{esc.urgency}]</p>
                                <button 
                                  onClick={async () => {
                                    setEscalations(prev => prev.filter(e => e.id !== esc.id));
                                    setStaffActionStatus(`Resolved ticket ${esc.id}!`);
                                    setTimeout(() => setStaffActionStatus(null), 3000);
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded text-[9px] border border-slate-800 uppercase cursor-pointer"
                                >
                                  Resolve
                                </button>
                              </div>
                              <p className="text-slate-300 mt-1">"{esc.desc}"</p>
                              <p className="text-[10px] text-slate-500 mt-1">By: {esc.name} ({esc.phone}) {esc.email ? `• ${esc.email}` : ""}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Shadow School Applications */}
                    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-xs text-[var(--yl)] uppercase">Shadow School Applicants ({schoolApplications.length})</h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Enrollment Desk</span>
                      </div>
                      {schoolApplications.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-mono text-center py-4">No student applications received yet.</p>
                      ) : (
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {schoolApplications.map(app => (
                            <div key={app.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-amber-400">{app.program}</span>
                                <span className="text-[9px] text-slate-500">{new Date(app.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                <p><span className="text-slate-500">Applicant:</span> {app.name} ({app.age} yrs)</p>
                                <p><span className="text-slate-500">Contact:</span> {app.phone} • {app.email}</p>
                                <p className="mt-1 text-slate-400 italic">"Reason: {app.reason}"</p>
                              </div>
                              <div className="flex justify-end gap-1 border-t border-slate-900 pt-1.5 mt-1">
                                <button 
                                  onClick={async () => {
                                    setSchoolApplications(prev => prev.filter(a => a.id !== app.id));
                                    setStaffActionStatus(`Application for ${app.name} processed!`);
                                    setTimeout(() => setStaffActionStatus(null), 3000);
                                  }}
                                  className="px-2 py-0.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 rounded text-[9px] font-bold uppercase cursor-pointer"
                                >
                                  Archive Application
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Compare Products Room */}
            {currentRoom === "compare" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 pb-20 bg-[#ffffff] p-2 sm:p-4 text-[#1a1a2e] min-h-screen">
                {/* Teleprompter styled with Blue and White */}
                <div className="bg-[#1a73e8] text-white py-2 mb-2 overflow-hidden flex items-center shadow-sm relative group select-none rounded">
                  <span className="flex-shrink-0 z-10 bg-[#1a73e8] pr-3 pl-4 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                    <span className="text-sm">📢</span> <span className="hidden sm:inline">NOTICE:</span>
                  </span>
                  <div className="flex-grow overflow-hidden relative">
                    <div className="whitespace-nowrap animate-marquee pause-marquee text-xs font-mono">
                      Welcome to Product Comparison! Compare two products side-by-side to find the best one for you. Select any 2 products and we'll show you the differences.
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border border-[#e8f0fe] rounded shadow-sm">
                  <h3 className="text-[#1a3a6b] font-bold text-base flex items-center gap-2 mb-2">
                    <GitCompare className="w-5 h-5 text-[#1a73e8]" /> Product Comparison
                  </h3>
                  <p className="text-[#555555] text-xs">Select two products below to compare their features, prices, and specifications.</p>
                </div>

                {/* Example Comparison Box */}
                {!showComparison && !compareProduct1 && !compareProduct2 && (
                  <div className="p-4 bg-white border border-[#e8f0fe] rounded shadow-sm">
                    <h3 className="text-[#1a3a6b] font-bold uppercase tracking-wider text-sm mb-3 border-b border-[#e8f0fe] pb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#1a73e8]" /> Example Comparison
                    </h3>
                    <div className="text-[10px] text-[#555555] font-mono mb-4 flex flex-col gap-1">
                      <p>Step 1: Click "Select Product" on the left side</p>
                      <p>Step 2: Click "Select Product" on the right side</p>
                      <p>Step 3: Click "Compare" to see the differences</p>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 border border-[#e8f0fe] p-2 text-center bg-white rounded">
                        <div className="text-[10px] text-[#555555] font-bold mb-1 uppercase">Select Product</div>
                        <div className="font-black text-xs text-[#1a3a6b]">HP 250 G9</div>
                        <div className="price text-xs font-mono text-[#1a1a2e]">₦400,000</div>
                      </div>
                      <div className="flex-1 border border-[#e8f0fe] p-2 text-center bg-white rounded">
                        <div className="text-[10px] text-[#555555] font-bold mb-1 uppercase">Select Product</div>
                        <div className="font-black text-xs text-[#1a3a6b]">HP 250 G8</div>
                        <div className="price text-xs font-mono text-[#1a1a2e]">₦750,000</div>
                      </div>
                    </div>
                    
                    <button disabled className="w-full py-2 bg-[#e8f0fe] text-[#1a73e8] font-bold uppercase text-[10px] tracking-widest cursor-not-allowed rounded">
                      📊 COMPARE THESE TWO PRODUCTS
                    </button>
                    
                    <div className="mt-4 p-3 bg-[#e8f0fe] rounded text-[10px] text-[#1a3a6b] leading-relaxed">
                      💡 When you click "Compare", you'll see a side-by-side view of both products showing: Price, Processor, RAM, Storage, Screen, and Stock Status.
                    </div>
                  </div>
                )}
                
                {/* Product Selection Area */}
                {!showComparison && (
                  <div className="bg-white border border-[#e8f0fe] p-4 shadow-sm flex flex-col gap-4 rounded">
                    <h3 className="text-[#1a3a6b] font-black uppercase tracking-wider text-sm border-b border-[#e8f0fe] pb-2">Your Comparison</h3>
                    
                    {/* Select Product 1 */}
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-xs font-bold text-[#1a3a6b] uppercase flex items-center gap-1">
                        Select Product 1
                      </label>
                      {compareProduct1 ? (
                        <div className="flex justify-between items-center border border-[#e8f0fe] p-2 bg-[#ffffff] rounded">
                          <div className="truncate pr-2">
                            <div className="text-xs font-black text-[#1a1a2e] truncate">{compareProduct1.n}</div>
                            <div className="price text-[10px] font-mono text-[#555555]">{compareProduct1.price}</div>
                          </div>
                          <button onClick={() => setCompareProduct1(null)} className="p-1 hover:bg-red-50 text-red-600 rounded flex-shrink-0 border border-transparent hover:border-red-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 relative">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Search product to compare..." 
                              value={compareSearch1}
                              onChange={(e) => setCompareSearch1(e.target.value)}
                              onFocus={() => setCompareSelectMode(1)}
                              className="w-full border border-[#e8f0fe] rounded p-2 text-xs pl-8 outline-none focus:border-[#1a73e8] bg-[#ffffff] text-[#1a1a2e]"
                            />
                            <Search className="w-4 h-4 absolute left-2 top-2.5 text-[#555555]" />
                          </div>
                          {compareSelectMode === 1 && compareSearch1.length > 1 && (
                            <div className="border border-[#e8f0fe] max-h-40 overflow-y-auto bg-white absolute z-20 w-full top-[100%] mt-1 shadow-lg rounded">
                              {products.filter(p => p.n.toLowerCase().includes(compareSearch1.toLowerCase()) || (p.pn && p.pn.toLowerCase().includes(compareSearch1.toLowerCase()))).slice(0, 10).map(p => (
                                <div 
                                  key={p.id} 
                                  className="p-2 border-b border-[#e8f0fe] hover:bg-[#e8f0fe] cursor-pointer text-xs flex justify-between items-center"
                                  onMouseDown={(e) => { e.preventDefault(); setCompareProduct1(p); setCompareSearch1(""); setCompareSelectMode(null); }}
                                >
                                  <span className="font-bold text-[#1a1a2e] truncate max-w-[70%]">{p.n}</span>
                                  <span className="price font-mono text-[10px] text-[#1a73e8]">{p.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Select Product 2 */}
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-xs font-bold text-[#1a3a6b] uppercase flex items-center gap-1">
                        Select Product 2
                      </label>
                      {compareProduct2 ? (
                        <div className="flex justify-between items-center border border-[#e8f0fe] p-2 bg-[#ffffff] rounded">
                          <div className="truncate pr-2">
                            <div className="text-xs font-black text-[#1a1a2e] truncate">{compareProduct2.n}</div>
                            <div className="price text-[10px] font-mono text-[#555555]">{compareProduct2.price}</div>
                          </div>
                          <button onClick={() => setCompareProduct2(null)} className="p-1 hover:bg-red-50 text-red-600 rounded flex-shrink-0 border border-transparent hover:border-red-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 relative">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Search product to compare..." 
                              value={compareSearch2}
                              onChange={(e) => setCompareSearch2(e.target.value)}
                              onFocus={() => setCompareSelectMode(2)}
                              className="w-full border border-[#e8f0fe] rounded p-2 text-xs pl-8 outline-none focus:border-[#1a73e8] bg-[#ffffff] text-[#1a1a2e]"
                            />
                            <Search className="w-4 h-4 absolute left-2 top-2.5 text-[#555555]" />
                          </div>
                          {compareSelectMode === 2 && compareSearch2.length > 1 && (
                            <div className="border border-[#e8f0fe] max-h-40 overflow-y-auto bg-white absolute z-20 w-full top-[100%] mt-1 shadow-lg rounded">
                              {products.filter(p => p.n.toLowerCase().includes(compareSearch2.toLowerCase()) || (p.pn && p.pn.toLowerCase().includes(compareSearch2.toLowerCase()))).slice(0, 10).map(p => (
                                <div 
                                  key={p.id} 
                                  className="p-2 border-b border-[#e8f0fe] hover:bg-[#e8f0fe] cursor-pointer text-xs flex justify-between items-center"
                                  onMouseDown={(e) => { e.preventDefault(); setCompareProduct2(p); setCompareSearch2(""); setCompareSelectMode(null); }}
                                >
                                  <span className="font-bold text-[#1a1a2e] truncate max-w-[70%]">{p.n}</span>
                                  <span className="price font-mono text-[10px] text-[#1a73e8]">{p.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 pt-4 border-t border-[#e8f0fe]">
                      <button 
                        onClick={() => setShowComparison(true)}
                        disabled={!compareProduct1 || !compareProduct2}
                        className="flex-1 py-3 bg-[#1a73e8] text-white font-bold uppercase tracking-widest text-xs border border-[#1a73e8] hover:bg-[#2b85e4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded"
                      >
                        <GitCompare className="w-4 h-4" /> Compare
                      </button>
                      <button 
                        onClick={() => { setCompareProduct1(null); setCompareProduct2(null); setShowComparison(false); setCompareSearch1(""); setCompareSearch2(""); }}
                        className="px-4 py-3 bg-white text-[#1a73e8] font-bold uppercase tracking-widest text-xs border border-[#1a73e8] hover:bg-[#e8f0fe] transition-colors flex items-center justify-center gap-2 rounded"
                      >
                        <RefreshCw className="w-4 h-4" /> Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Comparison Result */}
                {showComparison && compareProduct1 && compareProduct2 && (
                  <div className="bg-white border border-[#e8f0fe] rounded shadow-md flex flex-col mb-6">
                    <div className="bg-[#1a3a6b] text-white p-3 flex justify-between items-center rounded-t">
                      <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                        <GitCompare className="w-4 h-4" /> Comparison Result
                      </h3>
                      <div className="flex gap-2 text-white">
                        <button onClick={() => { setCompareProduct1(null); setCompareProduct2(null); setShowComparison(false); }} className="flex items-center gap-1 text-[10px] font-bold bg-[#1a73e8] hover:bg-[#2b85e4] px-2 py-1 rounded transition-colors" title="New Comparison">
                          <RefreshCw className="w-3 h-3" /> <span className="hidden sm:inline">NEW</span>
                        </button>
                        <button onClick={() => setShowComparison(false)} className="flex items-center gap-1 text-[10px] font-bold bg-[#1a73e8] hover:bg-[#2b85e4] px-2 py-1 rounded transition-colors" title="Close">
                          <X className="w-3 h-3" /> <span className="hidden sm:inline">CLOSE</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex w-full divide-x divide-[#e8f0fe]">
                      {/* Product 1 */}
                      <div className="flex-1 flex flex-col p-3 w-1/2">
                        <div className="h-[120px] bg-[#ffffff] border border-[#e8f0fe] rounded shadow-sm mb-3 flex items-center justify-center p-2 relative">
                          {(compareProduct1.imgFront || compareProduct1.imgManual || compareProduct1.imgSide || compareProduct1.imgBack || compareProduct1.imgTop) ? (
                            <img src={compareProduct1.imgFront || compareProduct1.imgManual || compareProduct1.imgSide || compareProduct1.imgBack || compareProduct1.imgTop} alt={compareProduct1.n} className="w-full h-full object-contain" />
                          ) : (
                            <Box className="w-10 h-10 text-slate-300" />
                          )}
                        </div>
                        <h4 className="font-black text-xs text-[#1a3a6b] leading-tight mb-1 min-h-[30px] line-clamp-2">{compareProduct1.n}</h4>
                        <div className="price text-sm font-mono font-bold text-[#1a1a2e] border-b border-[#e8f0fe] pb-2 mb-2">{compareProduct1.price}</div>
                        
                        <div className="flex flex-col gap-2 text-[10px] font-mono flex-grow">
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Brand:</span><br/><span className="text-[#1a1a2e]">{compareProduct1.n.split(" ")[0]}</span></div>
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Code:</span><br/><span className="text-[#1a1a2e]">{compareProduct1.pn || "—"}</span></div>
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Specs:</span><br/>
                            <div className="line-clamp-6 leading-tight text-[#1a1a2e]">{compareProduct1.sp}</div>
                          </div>
                          <div className="mt-auto pt-2"><span className="text-white font-bold bg-[#1a73e8] px-1.5 py-0.5 rounded flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> In Stock</span></div>
                        </div>
                        
                        <button onClick={() => addToCart(compareProduct1)} className="mt-4 w-full py-2 bg-[#1a73e8] text-white font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#2b85e4] transition-colors flex items-center justify-center gap-1">
                          <ShoppingCart className="w-3 h-3" /> Add to Order
                        </button>
                      </div>
                      
                      {/* Product 2 */}
                      <div className="flex-1 flex flex-col p-3 w-1/2">
                        <div className="h-[120px] bg-[#ffffff] border border-[#e8f0fe] rounded shadow-sm mb-3 flex items-center justify-center p-2 relative">
                          {(compareProduct2.imgFront || compareProduct2.imgManual || compareProduct2.imgSide || compareProduct2.imgBack || compareProduct2.imgTop) ? (
                            <img src={compareProduct2.imgFront || compareProduct2.imgManual || compareProduct2.imgSide || compareProduct2.imgBack || compareProduct2.imgTop} alt={compareProduct2.n} className="w-full h-full object-contain" />
                          ) : (
                            <Box className="w-10 h-10 text-slate-300" />
                          )}
                        </div>
                        <h4 className="font-black text-xs text-[#1a3a6b] leading-tight mb-1 min-h-[30px] line-clamp-2">{compareProduct2.n}</h4>
                        <div className="price text-sm font-mono font-bold text-[#1a1a2e] border-b border-[#e8f0fe] pb-2 mb-2">{compareProduct2.price}</div>
                        
                        <div className="flex flex-col gap-2 text-[10px] font-mono flex-grow">
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Brand:</span><br/><span className="text-[#1a1a2e]">{compareProduct2.n.split(" ")[0]}</span></div>
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Code:</span><br/><span className="text-[#1a1a2e]">{compareProduct2.pn || "—"}</span></div>
                          <div><span className="text-[#555555] font-sans font-bold uppercase text-[9px]">Specs:</span><br/>
                            <div className="line-clamp-6 leading-tight text-[#1a1a2e]">{compareProduct2.sp}</div>
                          </div>
                          <div className="mt-auto pt-2"><span className="text-white font-bold bg-[#1a73e8] px-1.5 py-0.5 rounded flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> In Stock</span></div>
                        </div>
                        
                        <button onClick={() => addToCart(compareProduct2)} className="mt-4 w-full py-2 bg-[#1a73e8] text-white font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#2b85e4] transition-colors flex items-center justify-center gap-1">
                          <ShoppingCart className="w-3 h-3" /> Add to Order
                        </button>
                      </div>
                    </div>
                    
                    {/* AI Response Section */}
                    <div className="border-t-2 border-dashed border-[#e8f0fe] bg-slate-50 p-4 flex flex-col gap-4">
                      <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 text-[#1a1a2e]">
                        🤖 AI COMPARISON ANALYSIS
                      </h3>
                      
                      <div className="flex flex-col gap-4 text-xs text-[#1a1a2e] leading-relaxed">
                        <div>
                          <p className="font-bold mb-2 uppercase tracking-wider text-[#555555]">📊 KEY DIFFERENCES:</p>
                          <div className="flex flex-col gap-3">
                            <p>1️⃣ <strong>Processor:</strong> {compareProduct1.n} ({compareProduct1.price}) has standard performance, while {compareProduct2.n} ({compareProduct2.price}) has upgraded performance components.</p>
                            <p>2️⃣ <strong>Performance:</strong> Higher-tier models are faster for multitasking, heavy apps, and demanding tasks. Standard models are good for basic browsing and office work.</p>
                            <p>3️⃣ <strong>Price:</strong> Compare the price tags – it is worth it if you do heavy work, video editing, or multitasking.</p>
                          </div>
                        </div>

                        <div className="bg-[#e8f0fe] p-4 rounded border border-[#1a73e8]/30">
                          <p className="font-bold mb-2 text-[#1a73e8] uppercase tracking-wider">💡 RECOMMENDATION:</p>
                          <p>If you are a student or do basic office work, the {compareProduct1.n} ({compareProduct1.price}) is perfect. If you do heavy multitasking or professional work, invest in the {compareProduct2.n} ({compareProduct2.price}) – it will serve you better in the long run.</p>
                        </div>

                        <p className="font-bold text-emerald-700 bg-emerald-50 p-3 rounded border border-emerald-200">✅ Your choice: Select the product that best fits your needs.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </main>

          {/* 3.5 Bottom Navigation - Fixed bottom bar */}
          <nav className="navbar bg-[var(--dk)]/95 backdrop-blur-md border-t-4 border-[#1a2a4a] overflow-x-auto">
            <div className="flex justify-between items-center px-2 py-1 max-w-[430px] mx-auto min-w-[430px]">
              {[
                { id: "gallery", label: "Gallery", icon: <Camera className="w-4 h-4" /> },
                { id: "video", label: "Videos", icon: <Video className="w-4 h-4" /> },
                { id: "display", label: "Display", icon: <Tv className="w-4 h-4" /> },
                { id: "showroom", label: "Show", icon: <Building className="w-4 h-4" /> },
                { id: "invoice", label: "Invoice", icon: <ShoppingCart className="w-4 h-4" /> },
                { id: "deals", label: "Deals", icon: <Tag className="w-4 h-4" /> },
                { id: "livesheet", label: "Prices", icon: <FileText className="w-4 h-4" /> },
                { id: "channels", label: "Channels", icon: <Network className="w-4 h-4" /> },
                { id: "operational", label: "Ops", icon: <MapPin className="w-4 h-4" /> },
                { id: "repair", label: "Repair", icon: <Wrench className="w-4 h-4" /> },
                { id: "info", label: "AI", icon: <MessageSquare className="w-4 h-4" /> },
                { id: "contact", label: "Contact", icon: <Mail className="w-4 h-4" /> },
                { id: "compare", label: "Compare", icon: <GitCompare className="w-4 h-4" /> },
                { id: "feedback", label: "Review", icon: <Star className="w-4 h-4" /> },
                { id: "pickup", label: "Pickup", icon: <Calendar className="w-4 h-4" /> },
                { id: "staff", label: "Staff", icon: <Lock className="w-4 h-4" /> },
                { id: "sheets", label: "Sheets", icon: <Database className="w-4 h-4" /> },
                { id: "school", label: "School", icon: <GraduationCap className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setCurrentRoom(tab.id); if (tab.id === "showroom") setActiveCategory(null); }}
                  className={`flex flex-col items-center py-1 flex-1 min-w-[28px] ${currentRoom === tab.id ? "text-red-700 border-t-2 border-red-700 font-bold" : "text-black/60"}`}
                >
                  {tab.icon}
                  <span className="text-[7px] tracking-tighter mt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                ℹ️ How to Use the Hublet
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex flex-col gap-6 flex-grow text-sm hide-scrollbar">
              <section>
                <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">📍 CUSTOMER ADVICE — Where to Start</h4>
                <ul className="flex flex-col gap-3">
                  <li className="leading-relaxed text-slate-300">
                    <strong className="text-white">BEST WAY TO START: DISPLAY FLOOR 🏪</strong> — Shows what is physically on display in the store. Every item shown here is available and on the shop floor. This is the cooler way to start.
                  </li>
                  <li className="leading-relaxed text-slate-300">
                    <strong className="text-white">💡 USING PRESETS</strong> — Tap any preset button (like DEFAULT or LAST IMPORTED SHEET) at the top of the rooms to change the view. DEFAULT shows our featured products.
                  </li>
                  <li className="leading-relaxed text-slate-300">
                    <strong className="text-white">FOR THE FULL CATALOGUE & TO PLACE AN ORDER: SHOWROOM 🛒</strong> — Browse by category, tap "Add to Order" to select items, selected items go directly to ORDERS & INVOICING.
                  </li>
                  <li className="leading-relaxed text-slate-300">
                    <strong className="text-white">TO VIEW PRODUCT IMAGES: GALLERY 🖼️</strong> — Shows pictures of products and office photos.
                  </li>
                  <li className="leading-relaxed text-slate-300">
                    <strong className="text-white">TO LEARN & EXPLORE: VIDEO GALLERY 🎬</strong> — Videos include: Manager's Address, How to Use the Hublet, Product Demos, Product Installation (how to mount and set up), Product Maintenance (how to maintain and care), Product Assembly (how to put together and dismantle).
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="text-blue-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">📱 NAVIGATION</h4>
                <p className="text-slate-300">Use the buttons at the <strong className="text-white">BOTTOM</strong> of the screen to switch between rooms.</p>
              </section>

              <section>
                <h4 className="text-amber-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">🔼 IMPORTANT: SCROLL UP</h4>
                <p className="text-slate-300">If you don't see the button you need, <strong className="text-amber-400">SCROLL UP</strong>. If the keyboard covers the button, <strong className="text-amber-400">SCROLL UP</strong>.</p>
              </section>

              <section>
                <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">🔙 BACK BUTTON</h4>
                <p className="text-slate-300">Tap the <strong className="text-white">"← Back"</strong> button at the top-left to go back to the previous page.</p>
              </section>

              <section>
                <h4 className="text-purple-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">🏠 ROOMS OVERVIEW</h4>
                <ol className="list-decimal pl-5 flex flex-col gap-2 text-slate-300 marker:text-purple-400 marker:font-bold text-xs">
                  <li><strong className="text-white">Display Floor 🏪</strong> — Quick view of products on display. Start here.</li>
                  <li><strong className="text-white">Showroom 🛒</strong> — Full catalogue by category. Browse all products.</li>
                  <li><strong className="text-white">Orders & Invoicing 📋</strong> — Review selected items and generate invoice.</li>
                  <li><strong className="text-white">Compare Room 📊</strong> — Compare up to 2 products side-by-side.</li>
                  <li><strong className="text-white">Hot Deals 🔥</strong> — Promotional and discounted products.</li>
                  <li><strong className="text-white">Price List 📊</strong> — Full product catalogue with all prices.</li>
                  <li><strong className="text-white">Gallery 🖼️</strong> — Browse product images and office photos.</li>
                  <li><strong className="text-white">Video Gallery 🎬</strong> — Watch product demos and tutorials.</li>
                  <li><strong className="text-white">Channels 📱</strong> — Connect with us on social media.</li>
                  <li><strong className="text-white">Operational Desk 🛎️</strong> — Contact our team for support.</li>
                  <li><strong className="text-white">Diagnostics Desk 🔧</strong> — Submit repair requests.</li>
                  <li><strong className="text-white">AI Support 🤖</strong> — Ask questions about products or orders.</li>
                  <li><strong className="text-white">GM Contact ⭐</strong> — Escalate major issues to General Manager.</li>
                  <li><strong className="text-white">Client Feedback 📝</strong> — Send us your feedback.</li>
                  <li><strong className="text-white">Pickup Scheduler 📅</strong> — Schedule time to collect orders.</li>
                </ol>
              </section>

              <section>
                <h4 className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">💡 ADDITIONAL TIPS</h4>
                <ul className="flex flex-col gap-2 text-slate-300 list-disc pl-5 text-xs">
                  <li>Tap 🔒 to access staff controls (staff only)</li>
                  <li>Tap 💬 AI Support to ask questions</li>
                  <li>Use the search bar to find products quickly</li>
                </ul>
              </section>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-3 shrink-0">
              <button 
                onClick={() => {
                  setShowGuide(false);
                  if (!inStore) {
                    setInStore(true);
                    _setCurrentRoom("showroom");
                  }
                }} 
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold text-white uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20"
              >
                🚪 Enter the Hublet
              </button>
              <button 
                onClick={() => setShowGuide(false)} 
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-white uppercase tracking-wider transition-colors border border-slate-700"
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Playback Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setPlayingVideo(null)} 
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              {playingVideo.url.includes("youtube.com") || playingVideo.url.includes("youtu.be") ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${playingVideo.url.includes("v=") ? playingVideo.url.split("v=")[1].split("&")[0] : playingVideo.url.split("/").pop()}?autoplay=1`} 
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : playingVideo.url.includes("vimeo.com") ? (
                <iframe 
                  src={`https://player.vimeo.com/video/${playingVideo.url.split("/").pop()}?autoplay=1`} 
                  className="w-full h-full border-0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={playingVideo.url} 
                  controls 
                  autoPlay 
                  className="w-full h-full outline-none"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            <div className="p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-900/50 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {playingVideo.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  📅 {new Date(playingVideo.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{playingVideo.title}</h2>
              {playingVideo.description && (
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{playingVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Product Detail Overlay */}
      <ProductDetailOverlay 
        selectedProduct={selectedProduct} 
        setSelectedProduct={setSelectedProduct}
        products={products}
        setProducts={setProducts}
        solarProducts={solarProducts}
        setSolarProducts={setSolarProducts}
        getDisplayPrice={getDisplayPrice}
        addToCart={addToCart}
        WA_SALES={WA_SALES}
      />
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}
