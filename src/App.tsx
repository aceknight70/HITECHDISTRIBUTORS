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
  GitCompare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, ensureAuth, OperationType, handleFirestoreError } from "./lib/firebase";
import { collection, addDoc, getDocs, onSnapshot, updateDoc, doc, setDoc, query, orderBy, limit, writeBatch } from "firebase/firestore";
import { PRODUCTS as initialProducts, SOLAR_PRODUCTS as initialSolarProducts, CATEGORIES, SOLAR_CATEGORIES, Product, SolarProduct, DEFAULT_CSV_DATA } from "./data/catalog";

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
  type: string;
  brand: string;
  problem: string;
  name: string;
  phone: string;
  ref: string;
  status: "Received" | "Diagnosed" | "Sent Away" | "In Repair" | "Returned" | "Ready for Pickup";
  aiComplexity?: string;
  aiCategory?: string;
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

const Teleprompter = ({ text }: { text: string }) => {
  return (
    <div className="bg-black text-white py-2 border-4 border-black mb-6 overflow-hidden flex items-center shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] relative group select-none">
      <span className="flex-shrink-0 z-10 bg-black pr-3 pl-4 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
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

const ProductCard = ({ p, onAdd, onView, index }: { p: Product; onAdd: (p: Product) => void; onView: (p: Product) => void; index: number; key?: any }) => {
  return (
    <div className="bg-white border-2 border-black p-4 flex flex-col gap-3 relative group hover:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] transition-all">
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
      
      <div className="w-full h-[160px] bg-white flex items-center justify-center border border-slate-200 rounded shadow-sm overflow-hidden relative cursor-pointer group-hover:shadow-md transition-shadow" onClick={() => onView(p)}>
        {p.imgFront || p.imgManual ? (
          <img src={p.imgManual || p.imgFront} alt={p.n} className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
        ) : (
          <div className="text-slate-400 opacity-50">
            {p.cat === "laptops" ? <Laptop className="w-16 h-16" /> : p.cat === "printers" ? <Printer className="w-16 h-16" /> : <Box className="w-16 h-16" />}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="px-2 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-wider">{p.brand || "HITECH"}</span>
        <span className="px-2 py-1 bg-slate-200 border border-black text-black text-[9px] font-bold uppercase tracking-wider">{p.cat}</span>
        <span className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-600 text-[9px] font-mono tracking-wider truncate max-w-[120px]">CODE: {p.pn || "—"}</span>
      </div>

      <div className="border-t border-black pt-2">
        <p className="text-[11px] text-slate-800 leading-tight line-clamp-2 min-h-[30px]">{p.desc}</p>
      </div>

      {p.bullets && (
        <div className="border-t border-black pt-2">
          <p className="text-[10px] text-slate-600 font-mono line-clamp-2">{p.bullets}</p>
        </div>
      )}

      <div className="border-t border-black pt-2 flex items-start gap-1">
        <span className="text-xs">⚙️</span>
        <p className="text-[11px] font-serif italic text-slate-800 line-clamp-2">{p.sp}</p>
      </div>

      <div className="border-t border-black pt-2 flex justify-between items-center">
        <span className="text-sm font-bold font-mono text-black">{p.price !== "CALL" && !p.price.includes("₦") ? "₦" : ""}{p.price}</span>
        {p.assurance && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">⭐ {p.assurance}</span>}
      </div>

      <div className="border-t border-black pt-2">
        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">🟢 {p.stock || "In Stock"}</span>
      </div>

      <div className="border-t border-black pt-2">
        <a href="#" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">👥 See what others think → Visit Website</a>
      </div>

      <div className="border-t border-black pt-3 flex gap-2">
        {p.price !== "CALL" && (
          <button onClick={(e) => { e.stopPropagation(); onAdd(p); }} className="flex-1 py-2 bg-black hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            🛒 ADD TO ORDER
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onView(p); }} className="flex-1 py-2 bg-white hover:bg-slate-100 border border-black text-black text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          🔍 VIEW DETAILS
        </button>
      </div>
    </div>
  );
};

const MediaUploadButton = ({ type, label, onUploadSuccess }: { type: "image" | "video", label: string, onUploadSuccess?: (url: string) => void, key?: any }) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("📤 Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setStatus("✅ Image uploaded successfully!");
          if (onUploadSuccess) onUploadSuccess(data.url);
        } else {
          throw new Error(data.error || "Unknown server error");
        }
      } else {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      console.warn("Vercel Blob failed, falling back to local storage base64:", err.message);
      setStatus("⚠️ API failed. Saving locally...");
      try {
        const base64Url = await fileToBase64(file);
        setStatus("✅ Image uploaded successfully! (Local)");
        if (onUploadSuccess) onUploadSuccess(base64Url);
      } catch (localErr) {
        setStatus("❌ Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-slate-700 transition-colors text-center w-full min-h-[32px]">
        {uploading ? <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" /> : <Upload className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate">{uploading ? "📤 Uploading..." : label}</span>
        <input
          type="file"
          accept={type === "image" ? "image/jpeg,image/png,image/webp" : "video/*"}
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
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
  getDisplayPrice, 
  addToCart,
  WA_SALES
}: {
  selectedProduct: Product | SolarProduct | null;
  setSelectedProduct: (p: Product | SolarProduct | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  getDisplayPrice: (p: Product | SolarProduct) => string;
  addToCart: (p: Product | SolarProduct) => void;
  WA_SALES: string;
}) => {
  const [activeView, setActiveView] = useState<"Manual" | "Front" | "Side" | "Back" | "Top">("Manual");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Reset view when product changes
  useEffect(() => {
    if (selectedProduct?.id) {
      setActiveView("Manual");
      setHasUnsavedChanges(false);
      setSaveStatus(null);
    }
  }, [selectedProduct?.id]);

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
    const p = selectedProduct as Product;
    let updatedProduct = { ...p };
    
    switch (view) {
      case "Manual": updatedProduct.imgManual = url; break;
      case "Front": updatedProduct.imgFront = url; break;
      case "Side": updatedProduct.imgSide = url; break;
      case "Back": updatedProduct.imgBack = url; break;
      case "Top": updatedProduct.imgTop = url; break;
    }
    
    setSelectedProduct(updatedProduct as any);
    setProducts(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct as Product : item));
    setActiveView(view);
    
    // Automatically save to Firestore as requested
    try {
      const docId = String(updatedProduct.id);
      const docRef = doc(db, "products", docId);
      await setDoc(docRef, JSON.parse(JSON.stringify(updatedProduct)), { merge: true });
      setSaveStatus("✅ Data saved successfully! All products and images are stored permanently.");
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (e: any) {
      console.error("Firestore auto-save error:", e);
      setSaveStatus("❌ Failed to save data. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    setSaveStatus("Saving...");
    try {
      // Sanitize the object completely to ensure serializability (removes undefined, functions, etc.)
      const dataToSave = JSON.parse(JSON.stringify(selectedProduct));
      console.log("Attempting to save to Firestore. docId:", selectedProduct.id, "data:", dataToSave);

      if (!selectedProduct.id) {
        throw new Error("Cannot save: Product ID is missing.");
      }

      const docId = String(selectedProduct.id);
      if (docId.includes("/")) {
         throw new Error("Invalid Product ID: contains slashes.");
      }

      const docRef = doc(db, "products", docId);
      await setDoc(docRef, dataToSave, { merge: true });
      
      setSaveStatus("✅ Data saved successfully! All products and images are stored permanently.");
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      console.error("Firestore save error:", e);
      console.error("Data that failed to save:", selectedProduct);
      setSaveStatus("❌ Failed to save data. Please try again.");
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="w-full max-w-[430px] bg-[var(--dk2)] border-t border-slate-800 rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
               onClick={(e) => e.stopPropagation()}>
            
            {/* Drag Handle */}
            <div className="h-6 w-full flex items-center justify-center border-b border-slate-900 flex-shrink-0 cursor-pointer"
                 onClick={() => setSelectedProduct(null)}>
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
                  <img src={currentImageUrl} alt={`${selectedProduct.n} ${activeView}`} className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="opacity-50 flex flex-col items-center">
                    {selectedProduct.cat === "laptops" ? <Laptop className="w-12 h-12 mb-2" /> : <Printer className="w-12 h-12 mb-2" />}
                    <span className="text-[10px] uppercase font-bold text-slate-400">No {activeView} Image</span>
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
                    onClick={handleSaveChanges}
                    disabled={saveStatus === "Saving..." || !hasUnsavedChanges}
                    className={`flex-1 py-2 ${hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 text-slate-400 cursor-not-allowed'} text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-colors`}
                  >
                    💾 SAVE CHANGES
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    ❌ CANCEL
                  </button>
                </div>
                {saveStatus && (
                  <p className={`text-[10px] font-mono text-center ${saveStatus.includes("✅") ? "text-emerald-400" : saveStatus.includes("❌") ? "text-red-400" : "text-amber-400"}`}>
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
                    className="text-xs font-mono font-bold text-[var(--yl)] flex-shrink-0 bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-24 text-right transition-colors pb-1"
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
                    className="text-[10px] text-slate-500 font-mono bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full transition-colors"
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
                  className="text-xs text-[var(--mu)] leading-relaxed font-mono bg-transparent border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full transition-colors mt-1 pb-1"
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
                  className="text-xs text-slate-300 leading-relaxed bg-transparent border border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none w-full resize-none min-h-[60px] transition-colors p-1 rounded"
                />
              </div>

              <div className="flex gap-2.5 pt-4 mt-auto">
                <button
                  onClick={() => {
                    const text = `Hello HiTech, I would like to make an enquiry about: ${selectedProduct.n} (Price: ${getDisplayPrice(selectedProduct)})`;
                    window.open(`https://wa.me/${WA_SALES}?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex-1 py-3 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800"
                >
                  WhatsApp
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

export default function App() {
  // App navigation state
  const [inStore, setInStore] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("showroom");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | SolarProduct | null>(null);
  
  // Compare Room State
  const [compareProduct1, setCompareProduct1] = useState<Product | SolarProduct | null>(null);
  const [compareProduct2, setCompareProduct2] = useState<Product | SolarProduct | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareSelectMode, setCompareSelectMode] = useState<1 | 2 | null>(null);
  const [compareSearch1, setCompareSearch1] = useState("");
  const [compareSearch2, setCompareSearch2] = useState("");
  const [storefrontImage, setStorefrontImage] = useState<string>(() => {
    return localStorage.getItem("ht_storefront_image") || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
  });

  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleStorefrontPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image. Server error.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        setStorefrontImage(data.url);
        localStorage.setItem("ht_storefront_image", data.url);
        setUploadStatus("Upload successful! Applied to starting page.");
      } else {
        throw new Error(data.error || "Failed to parse upload response.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`Upload error: ${err.message || "Please check your server."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const [productOverrides, setProductOverrides] = useState<Record<string, Partial<Product>>>({});

  // Dynamic Product lists with Preset application
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [solarProducts, setSolarProducts] = useState<SolarProduct[]>(initialSolarProducts);
  const [currentPreset, setCurrentPreset] = useState<"DEFAULT" | "PROMO HIGH" | "SEASONAL DEALS" | "WORKBOOK DISPLAY" | "LAST IMPORTED SHEET">("DEFAULT");
  
  const [customPresets, setCustomPresets] = useState<Record<string, string[]>>({});
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
  
  const [galleryImages, setGalleryImages] = useState([
    { title: "HP Printers Section", url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80", caption: "All-in-One InkTank and heavy LaserJet workspace scanners in stock." },
    { title: "Solar Inverter Bank", url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=80", caption: "Selection of Cworth hybrids and Felicity smart battery storage units." },
    { title: "Desktop Configuration", url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&q=80", caption: "HP EliteDesk and All-in-One workstations configured on display." }
  ]);

  const [galleryVideos, setGalleryVideos] = useState([
    { title: "HiTech Emporium Grand Tour", duration: "12:45", views: "1.2k" },
    { title: "Solar Inverter Installation", duration: "08:20", views: "342" },
    { title: "HP Laptop Repair Guide", duration: "15:10", views: "890" },
    { title: "New Printer Setup", duration: "05:30", views: "156" }
  ]);
  
  // Storage falls back to localStorage if Firestore hasn't provisioned yet
  const [repairs, setRepairs] = useState<RepairSubmission[]>([]);
  const [gmRequests, setGmRequests] = useState<GMRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackReview[]>([
    { id: "f1", name: "Oghenetega W.", rating: 5, comment: "Excellent service. Got my HP EliteDesk desktop here and the speed is incredible. High quality!", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "f2", name: "Chinedu O.", rating: 4, comment: "Helpful assistant and clean showroom. The choice inverter works great for my office.", timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
  ]);
  const [pickups, setPickups] = useState<PickupSlot[]>([]);
  const [customDeals, setCustomDeals] = useState<CustomDeal[]>([
    { id: "d1", title: "HP Laser MFP 107w", desc: "Laser, Wireless, Compact, Fast print", oldPrice: "₦330,000", newPrice: "₦250,000", badge: "SPECIAL PROMO" },
    { id: "d2", title: "HP Pavilion 13 Core i3", desc: "Core i3-1115G4, 8GB, 256GB SSD, Silver", oldPrice: "₦780,000", newPrice: "₦650,000", badge: "PROMO LAPTOP" },
    { id: "d3", title: "HP 250 Core i7", desc: "Intel Core i7, 1TB HDD, 8GB RAM, 15.6”", oldPrice: "₦920,000", newPrice: "₦750,000", badge: "PROMO LAPTOP" },
    { id: "d4", title: "HP 15 Core i5", desc: "Core i5-10210U, 12GB, 1TB, Win10", oldPrice: "₦820,000", newPrice: "₦685,000", badge: "PROMO LAPTOP" },
    { id: "d5", title: "460W Solar Panel (Used)", desc: "460W Monocrystalline, Tested", oldPrice: "₦95,000", newPrice: "₦50,000", badge: "BUDGET SOLAR" }
  ]);
  const [managerAvailable, setManagerAvailable] = useState(true);
  const [bankInfo, setBankInfo] = useState("Zenith Bank • HiTech Distributors • 1012345678");

  // Cart/Invoicing state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<"draft" | "generated" | "paid">("draft");
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
  const [repairDeviceType, setRepairDeviceType] = useState("Laptop");
  const [repairBrandModel, setRepairBrandModel] = useState("");
  const [repairProblem, setRepairProblem] = useState("");
  const [repairCustName, setRepairCustName] = useState("");
  const [repairCustPhone, setRepairCustPhone] = useState("");
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [trackRef, setTrackRef] = useState("");
  const [trackResult, setTrackResult] = useState<RepairSubmission | null>(null);
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

  // Initialize and ensure Auth
  useEffect(() => {
    ensureAuth();
    
    // Load local storage fallbacks first
    const localRepairs = localStorage.getItem("ht_repairs");
    if (localRepairs) setRepairs(JSON.parse(localRepairs));

    const localGmRequests = localStorage.getItem("ht_gm_requests");
    if (localGmRequests) setGmRequests(JSON.parse(localGmRequests));

    const localFeedbacks = localStorage.getItem("ht_feedbacks");
    if (localFeedbacks) setFeedbacks(JSON.parse(localFeedbacks));

    const localPickups = localStorage.getItem("ht_pickups");
    if (localPickups) setPickups(JSON.parse(localPickups));

    const localCustomDeals = localStorage.getItem("ht_custom_deals");
    if (localCustomDeals) setCustomDeals(JSON.parse(localCustomDeals));

    const localBankInfo = localStorage.getItem("ht_bank_info");
    if (localBankInfo) setBankInfo(localBankInfo);

    const localPreset = localStorage.getItem("ht_preset");
    if (localPreset) setCurrentPreset(localPreset as any);

    const localCustomPresets = localStorage.getItem("ht_custom_presets");
    if (localCustomPresets) {
      try {
        setCustomPresets(JSON.parse(localCustomPresets));
      } catch (e) {}
    }

    // Sync from Firestore collections if available
    try {
      onSnapshot(collection(db, "repairs"), (snapshot) => {
        const list: RepairSubmission[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        if (list.length > 0) {
          setRepairs(list.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt)));
        }
      }, (e) => console.log("repairs snapshot error:", e));

      onSnapshot(collection(db, "gm_requests"), (snapshot) => {
        const list: GMRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        if (list.length > 0) {
          setGmRequests(list.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
        }
      }, (e) => console.log("gm_requests snapshot error:", e));

      onSnapshot(collection(db, "feedback"), (snapshot) => {
        const list: FeedbackReview[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        if (list.length > 0) {
          setFeedbacks(list.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
        }
      }, (e) => console.log("feedback snapshot error:", e));

      onSnapshot(collection(db, "pickups"), (snapshot) => {
        const list: PickupSlot[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        if (list.length > 0) {
          setPickups(list.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
        }
      }, (e) => console.log("pickups snapshot error:", e));

      onSnapshot(collection(db, "products"), (snapshot) => {
        const loadedProducts: Product[] = [];
        const overrides: Record<string, Partial<Product>> = {};
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (doc.id.startsWith("csv-") || doc.id.startsWith("imp-")) {
            loadedProducts.push({ ...data, id: doc.id } as Product);
          } else {
            overrides[doc.id] = data as Partial<Product>;
          }
        });
        
        if (loadedProducts.length > 0) {
           setProducts(loadedProducts.sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)));
        }
        setProductOverrides(overrides);
      }, (e) => console.log("products snapshot error:", e));

      onSnapshot(doc(db, "settings", "presets"), (docSnap) => {
        if (docSnap.exists()) {
          setCustomPresets(docSnap.data() as Record<string, string[]>);
        }
      }, (e) => console.log("presets snapshot error:", e));
    } catch (err) {
      console.warn("Firestore listener initialization skipped (offline/unconfigured fallback).");
    }
  }, []);

  // Sync to local storage on adjustments (for robust offline fallback)
  const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const displayedProducts = React.useMemo(() => {
    let list: Product[] = [];
    
    if (customPresets[currentPreset]) {
      const allPossible = [
        ...products, 
        ...DEFAULT_CSV_DATA.map((p, i) => ({
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
        }))
      ];
      
      const targetNumbers = customPresets[currentPreset];
      list = allPossible.filter(p => {
        let numStr = p.displayOrder ? String(p.displayOrder) : "";
        if (!numStr) {
           const idx = products.findIndex(x => x.id === p.id);
           if (idx !== -1) numStr = String(idx + 1);
        }
        return targetNumbers.includes(numStr);
      });
      list.sort((a, b) => {
         const getNum = (p: Product) => {
           if (p.displayOrder) return String(p.displayOrder);
           const idx = products.findIndex(x => x.id === p.id);
           if (idx !== -1) return String(idx + 1);
           return "";
         };
         return targetNumbers.indexOf(getNum(a)) - targetNumbers.indexOf(getNum(b));
      });
    } else {
      list = products;
      if (currentPreset === "DEFAULT") {
        list = DEFAULT_CSV_DATA.map((p, i) => ({
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
        }));
      } else if (currentPreset === "PROMO HIGH") list = list.filter(p => p.promo);
      else if (currentPreset === "SEASONAL DEALS") list = list.filter(p => p.newp || p.cat === "laptops");
      else if (currentPreset === "LAST IMPORTED SHEET") list = list.filter(p => p.id && (p.id.startsWith("imp-") || p.id.startsWith("csv-")));
      else if (currentPreset === "WORKBOOK DISPLAY") list = list.filter(p => p.id && !(p.id.startsWith("imp-") || p.id.startsWith("csv-")));
    }

    // Apply Firestore overrides
    list = list.map(item => {
      if (productOverrides[item.id]) {
        return { ...item, ...productOverrides[item.id] } as Product;
      }
      return item;
    });

    return list;
  }, [products, currentPreset, productOverrides, customPresets]);


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

  // Submit Invoice to Firestore / Local Storage
  const submitInvoiceOrder = async () => {
    if (!customerName || !customerPhone) {
      alert("Please enter customer name and phone.");
      return;
    }

    const orderRecord = {
      id: "ORD-" + Date.now().toString().slice(-6),
      customerName,
      phone: customerPhone,
      items: JSON.stringify(cart.map(item => ({ id: item.product.id, name: item.product.n, quantity: item.quantity, price: getDisplayPrice(item.product) }))),
      total: calculateCartTotal(),
      paid: invoiceStatus === "paid" || !!paymentReceipt,
      receiptUrl: paymentReceipt || "",
      timestamp: new Date().toISOString(),
      status: "Pending Payment" as any,
    };

    try {
      await addDoc(collection(db, "orders"), orderRecord);
    } catch (e) {
      // Local fallback
      const localOrders = JSON.parse(localStorage.getItem("ht_orders") || "[]");
      localStorage.setItem("ht_orders", JSON.stringify([orderRecord, ...localOrders]));
    }

    // Launch WhatsApp
    const orderText = `Hi HiTech Distributors, I have created an invoice for my order (ID: ${orderRecord.id}).\nCustomer: ${customerName} (${customerPhone})\nTotal: ₦${orderRecord.total.toLocaleString()}\nThank you!`;
    const waLink = `https://wa.me/${WA_SALES}?text=${encodeURIComponent(orderText)}`;
    window.open(waLink, "_blank");

    setInvoiceStatus("paid");
  };

  // Submit Repair Triage with AI evaluation
  const submitRepairDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairBrandModel || !repairProblem || !repairCustName || !repairCustPhone) {
      alert("Please fill in all repair details.");
      return;
    }

    setSubmittingRepair(true);

    const refCode = `HT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    let aiCategory = "General Hardware";
    let aiComplexity = "Medium";

    // Request AI Triage from Gemini
    try {
      const res = await fetch("/api/gemini/repair-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: repairProblem }),
      });
      if (res.ok) {
        const triage = await res.json();
        aiCategory = triage.category;
        aiComplexity = triage.complexity;
      }
    } catch (e) {
      console.warn("AI repair triage failed, utilizing fallback defaults.", e);
    }

    const newRepair: RepairSubmission = {
      id: "REP-" + Date.now().toString().slice(-6),
      type: repairDeviceType,
      brand: repairBrandModel,
      problem: repairProblem,
      name: repairCustName,
      phone: repairCustPhone,
      ref: refCode,
      status: "Received",
      aiCategory,
      aiComplexity,
      submittedAt: new Date().toISOString(),
    };

    // Save
    try {
      await addDoc(collection(db, "repairs"), newRepair);
    } catch (e) {
      const updatedList = [newRepair, ...repairs];
      setRepairs(updatedList);
      saveLocal("ht_repairs", updatedList);
    }

    // Send WhatsApp notification
    const waText = `Hello, I just registered a repair request on your Hublet app.\nRef: ${refCode}\nDevice: ${repairDeviceType} (${repairBrandModel})\nProblem: ${repairProblem}\nCustomer: ${repairCustName}`;
    const link = `https://wa.me/${WA_GEN}?text=${encodeURIComponent(waText)}`;
    window.open(link, "_blank");

    // Reset Form
    setRepairBrandModel("");
    setRepairProblem("");
    setRepairCustName("");
    setRepairCustPhone("");
    setSubmittingRepair(false);

    alert(`Repair logged successfully! Reference number: ${refCode}`);
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

    try {
      await addDoc(collection(db, "gm_requests"), requestRecord);
    } catch (e) {
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

    try {
      await addDoc(collection(db, "feedback"), review);
    } catch (e) {
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

    try {
      await addDoc(collection(db, "pickups"), booking);
    } catch (e) {
      const list = [booking, ...pickups];
      setPickups(list);
      saveLocal("ht_pickups", list);
    }

    setPickupBooked(true);
    setPickupName("");
    setPickupPhone("");
    setPickupItems("");
  };

  // Staff Room login authentication
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    if (staffPIN === "12345" || staffPIN === "qw123#@") {
      setStaffIsLoggedIn(true);
    } else {
      setStaffError("Invalid Access PIN or Manager Key.");
    }
  };

  // CSV Google Sheets sheet importer parser
  const handleCsvImport = async () => {
    if (!csvText.trim()) {
      setCsvStatus("Please enter CSV sheet text.");
      return;
    }

    try {
      const rows = csvText.split("\n");
      const importedProducts: Product[] = [];
      
      rows.forEach((row, i) => {
        if (i === 0 || !row.trim()) return; // skip header or empty rows
        const cols = row.split(",");
        
        // If the first column is a pure number or if the header has "No.", we assume shifted cols
        const isShifted = !isNaN(Number(cols[0]?.trim())) || rows[0].toLowerCase().startsWith("no");
        const offset = isShifted ? 1 : 0;
        const displayOrder = isShifted ? cols[0]?.trim() : String(i);

        if (cols.length >= 6 + offset) {
          importedProducts.push({
            id: `csv-${displayOrder}`, // Unique ID for this row to allow merging
            displayOrder: displayOrder,
            pn: cols[0 + offset]?.trim() || "—",
            cat: cols[1 + offset]?.trim().toLowerCase() || "laptops",
            n: cols[2 + offset]?.trim() || "Imported Product",
            sp: cols[3 + offset]?.trim() || "Imported Specifications",
            price: cols[4 + offset]?.trim() || "CALL",
            desc: cols[5 + offset]?.trim() || "Imported from CSV Sheet",
            promo: cols[6 + offset]?.trim().toLowerCase() === "true",
            newp: cols[7 + offset]?.trim().toLowerCase() === "true"
          });
        }
      });

      if (importedProducts.length > 0) {
        setCsvStatus(`Saving ${importedProducts.length} items to permanent storage...`);
        try {
           const batch = writeBatch(db);
           importedProducts.forEach(p => {
             const docRef = doc(db, "products", p.id);
             batch.set(docRef, p, { merge: true }); // MERGE to not overwrite existing photos
           });
           await batch.commit();
           
           setProducts(importedProducts);
           setCurrentPreset("LAST IMPORTED SHEET");
           setCsvStatus(`✅ Data saved successfully! All products and images are stored permanently.`);
        } catch (err) {
           console.error("Firestore save error:", err);
           setCsvStatus("❌ Failed to save data. Please try again.");
        }
      } else {
        setCsvStatus("Could not parse any valid rows. Ensure format is: No.,P/N,Category,Name,Spec,Price,Description,Promo,New");
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
              localStorage.setItem("ht_preset", preset.id);
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
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
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
                    try {
                      await setDoc(doc(db, "settings", "presets"), newPresets, { merge: true });
                    } catch (e) {
                      console.warn("Failed to sync preset to Firestore:", e);
                      // Fallback to local
                      localStorage.setItem("ht_custom_presets", JSON.stringify(newPresets));
                    }
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
            <div className="flex justify-between items-baseline border-b-4 border-black pb-4 mb-6">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-[.4em] uppercase mb-1 opacity-60 font-sans">The Network Hub</span>
                <h1 className="text-5xl font-black tracking-tighter leading-none uppercase text-black font-sans">HiTech Hub</h1>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mb-1">System Protocol</span>
                <span className="text-xs font-serif italic text-black">v.2.40 Beta</span>
              </div>
            </div>
            
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-left text-sm font-serif italic text-slate-800 leading-relaxed max-w-sm mb-4"
            >
              Curated professional systems, advanced print solutions, and premium-configured solar energy infrastructures. Designed with editorial rigor and engineering precision.
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
          <div className="my-6 overflow-hidden rounded-xl border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] relative max-h-[220px]">
            <img
              src={storefrontImage}
              alt="HiTech Distributors Facade"
              referrerPolicy="no-referrer"
              className="w-full h-[220px] object-cover object-center brightness-95 hover:brightness-100 transition-all duration-300"
              onError={() => {
                const defaultFallback = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
                if (storefrontImage !== defaultFallback) {
                  setStorefrontImage(defaultFallback);
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
                <span key={idx} className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border border-black bg-white text-black">
                  {tag}
                </span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setInStore(true); setCurrentRoom("showroom"); }}
              className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-none"
            >
              Enter Showroom →
            </motion.button>

            <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase text-center mt-2">
              {STORE.addr} · {STORE.phone}
            </p>
          </div>
        </div>
      ) : (
        // Main App Experience
        <div className="flex flex-col flex-grow bg-[var(--dk)] pb-24">
          
          {/* 3.4 Topboard - Fixed top bar */}
          <header className="sticky top-0 z-40 w-full bg-[var(--dk)]/95 backdrop-blur-md border-b-4 border-black py-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => setInStore(false)} className="p-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors">
                <Home className="w-4 h-4" />
              </button>
              <div className="font-black text-sm tracking-tighter flex items-center uppercase font-sans text-black">
                <span>HI</span>
                <span className="text-red-700">TECH</span>
                <span className="text-[9px] uppercase text-slate-500 font-light font-mono ml-1.5 pl-1.5 border-l border-black hidden sm:inline">Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-wider bg-black text-white px-2.5 py-1 border border-black flex items-center gap-1">
                <span>{currentRoom}</span>
              </span>
              {cart.length > 0 && (
                <button onClick={() => setCurrentRoom("invoice")} className="relative p-1.5 border border-black bg-white text-black">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Room Content */}
          <main className="flex-grow p-4 overflow-y-auto max-w-[430px] mx-auto w-full">
            
            {/* Showroom Room */}
            {currentRoom === "showroom" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Teleprompter text="Welcome to the Showroom! Browse our full product catalogue by category. Select a category to view products, and click 'Add to Order' to start building your order." />
                <PresetSelector />
                <div className="mb-8 p-6 bg-[var(--dk)] border-4 border-black shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
                  <h3 className="text-black font-black uppercase text-2xl tracking-tighter mb-2 flex items-center gap-2">
                    <Building className="w-6 h-6" /> HiTech Distributors Hub
                  </h3>
                  <p className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">{STORE.addr}</p>
                  <div className="flex gap-3 items-center text-xs font-bold uppercase border-t-2 border-black pt-4">
                    <span className={`w-3 h-3 border-2 border-black ${managerAvailable ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-black">{managerAvailable ? "Manager Available In-Store" : "Manager Busy / On-Site"}</span>
                  </div>
                </div>

                {!activeCategory ? (
                  <>
                    <h4 className="text-[10px] font-bold uppercase tracking-[.3em] text-slate-400 mb-4 border-b-2 border-black pb-2">Browse Directory</h4>
                    <div className="grid grid-cols-2 gap-px bg-black border-2 border-black mb-8">
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
                        className="bg-[var(--dk)] p-5 flex flex-col justify-between hover:bg-black hover:text-white transition-all cursor-pointer group min-h-[140px] text-left col-span-2 border-t border-black"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-3xl font-serif italic font-light opacity-80">11</span>
                          <div className="text-amber-500">
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
                    <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4">
                      <button onClick={() => setActiveCategory(null)} className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-2 hover:opacity-50">
                        <span className="text-lg">←</span> Back
                      </button>
                      <h4 className="text-3xl font-black uppercase tracking-tighter text-black leading-none">
                        {CATEGORIES.find(c => c.id === activeCategory)?.name}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-4">
                      {displayedProducts.filter(p => p.cat === activeCategory).map((p, index) => (
                        <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} />
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
                  <p className="text-[11px] text-[var(--mu)]">Virtual interactive showroom display stand. Tap any product to view premium live specifications.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {displayedProducts.slice(0, 42).map((p, index) => (
                    <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hit Deals Room */}
            {currentRoom === "deals" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                <Teleprompter text="Welcome to Hot Deals! Don't miss out on our best promotions and discounts. These products are available at special prices. Act fast — these deals won't last long!" />
                <PresetSelector />
                <div className="p-6 bg-black border-4 border-black mb-2 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
                  <h3 className="text-white font-black uppercase tracking-tighter text-2xl flex items-center gap-2 mb-2">
                    <Tag className="w-6 h-6 text-red-500" /> Active Flash Deals
                  </h3>
                  <p className="text-xs font-mono tracking-widest uppercase text-slate-400">Exclusive promotional flash discounts. Claim to reserve on WhatsApp before stock finishes.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {displayedProducts.filter(p => p.promo).map((p, index) => (
                    <ProductCard key={p.id} p={p} index={products.indexOf(p)} onAdd={addToCart} onView={setSelectedProduct} />
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
                      <div className="w-1/3 text-right font-mono font-bold text-[var(--yl)] text-xs">
                        {getDisplayPrice(p)}
                      </div>
                    </div>
                  ))}

                  <div className="h-[2px] bg-slate-800 my-4" />
                  <p className="text-[10px] uppercase text-amber-500 font-mono tracking-wider">☀ Solar Hub Live Sheet</p>
                  
                  {displayedSolarProducts.map(s => (
                    <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-slate-800/40 hover:bg-slate-900/30 px-1 cursor-pointer rounded"
                         onClick={() => setSelectedProduct(s)}>
                      <div className="min-w-0 w-2/3 pr-2">
                        <p className="font-bold text-xs text-amber-100 truncate">{s.n}</p>
                        <p className="text-[9px] text-amber-500/80 truncate font-mono">{s.sp}</p>
                      </div>
                      <div className="w-1/3 text-right font-mono font-bold text-amber-400 text-xs">
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
                    onUploadSuccess={(url) => {
                      setGalleryImages(prev => [{ title: "New Uploaded Photo", caption: "User uploaded image", url }, ...prev]);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-[var(--dk2)] shadow-lg">
                      <img src={img.url} alt={img.title} referrerPolicy="no-referrer" className="w-full h-48 object-cover" />
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-[var(--yl)] mb-1 uppercase font-mono">{img.title}</h4>
                        <p className="text-[11px] text-slate-300">{img.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Video Gallery Room */}
            {currentRoom === "video" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Video Gallery! Watch product demos, staff introductions, and tutorials. Click any video to play and learn more about our products and services." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-red-500 font-bold text-base flex items-center gap-2">
                    <Video className="w-5 h-5" /> Installation & Video Reviews
                  </h3>
                  <p className="text-xs text-[var(--mu)] mb-3">In-depth installation videos, customer feedback, and quick product overviews.</p>
                  
                  <div className="flex gap-2">
                    <input type="text" placeholder="🔍 Search video library..." className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 outline-none" />
                  </div>
                  
                  <div className="mt-2">
                    <MediaUploadButton 
                      type="video" 
                      label="Upload Video" 
                      onUploadSuccess={(url) => {
                        setGalleryVideos(prev => [{ title: "New Video Upload", duration: "00:00", views: "0", url }, ...prev]);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {galleryVideos.map((vid, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-slate-800 bg-[var(--dk2)] shadow-lg cursor-pointer hover:border-slate-600 group">
                      <div className="w-full h-24 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                        {vid.url ? (
                          <video src={vid.url} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <Video className="w-8 h-8 text-slate-700 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/80 text-white px-1 rounded font-mono">{vid.duration}</span>
                      </div>
                      <div className="p-2">
                        <h4 className="font-bold text-[10px] text-[var(--yl)] leading-tight mb-1 line-clamp-2">{vid.title}</h4>
                        <p className="text-[8px] text-[var(--mu)] font-mono">{vid.views} views</p>
                      </div>
                    </div>
                  ))}
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
                            <p className="text-[9px] text-[var(--mu)] font-mono">{getDisplayPrice(item.product)} x {item.quantity}</p>
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
                        <span className="text-sm font-bold font-mono text-[var(--yl)]">₦{calculateCartTotal().toLocaleString()}</span>
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
                      <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                        <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Customer Information</p>
                        <input
                          type="text"
                          placeholder="Customer Full Name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-slate-950 rounded-lg border border-slate-800 px-3 py-2 text-xs text-[var(--cr)] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Active WhatsApp Phone Number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-slate-950 rounded-lg border border-slate-800 px-3 py-2 text-xs text-[var(--cr)] outline-none"
                        />
                        <button
                          onClick={() => setInvoiceStatus("generated")}
                          className="w-full py-3 bg-[var(--bl)] hover:bg-blue-600 rounded-lg text-xs font-bold text-white uppercase tracking-wider"
                        >
                          Generate Official Invoice →
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl flex flex-col gap-4">
                        <div className="text-center">
                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-400 font-mono">OFFICIAL INVOICE GENERATED</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex flex-col gap-1.5 bg-slate-950 p-3 rounded">
                          <p>Billed To: {customerName}</p>
                          <p>Phone: {customerPhone}</p>
                          <p>Date: {new Date().toLocaleDateString()}</p>
                          <p className="border-t border-slate-800 my-1 pt-1 font-bold text-[var(--yl)]">Grand Total: ₦{calculateCartTotal().toLocaleString()}</p>
                        </div>

                        <div className="bg-[var(--dk2)] p-3 rounded-lg border border-slate-800 text-xs">
                          <p className="font-bold text-[var(--yl)] mb-1">🏦 Direct Bank Payment Instructions</p>
                          <p className="text-[11px] text-slate-300 mb-2">{bankInfo}</p>
                          <p className="text-[10px] text-[var(--mu)]">Please transfer the total invoice amount to this bank account and upload your payment confirmation receipt below.</p>
                        </div>

                        {/* Phase 1: Upload test file form inside invoice desk */}
                        <form onSubmit={handleFileUpload} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Proof of Payment upload</p>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                              className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-200 file:cursor-pointer"
                            />
                            <button
                              type="submit"
                              disabled={uploadLoading}
                              className="px-3 py-1 bg-gradient-to-r from-[var(--rd2)] to-[var(--rd)] text-xs text-white rounded font-bold hover:opacity-90 flex-shrink-0"
                            >
                              {uploadLoading ? "Uploading..." : "Upload"}
                            </button>
                          </div>
                          {uploadUrl && (
                            <p className="text-[10px] text-emerald-400 font-mono break-all">✓ Receipt verified: {uploadUrl}</p>
                          )}
                          {uploadError && (
                            <p className="text-[10px] text-red-500 font-mono">{uploadError}</p>
                          )}
                        </form>

                        <button
                          onClick={submitInvoiceOrder}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 rounded-lg text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> I Have Paid - Notify on WhatsApp
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
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-amber-500 font-bold text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Operational Desk
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Find active business coordinates, branch locations, logistics delivery timelines, and bank accounts.</p>
                </div>

                <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-[var(--yl)] border-b border-slate-800 pb-2">📍 Warri Headquarters</h4>
                  <div className="text-xs text-slate-300 flex flex-col gap-2">
                    <p><strong>Address:</strong> 6 Airport Road, Warri, Delta State, Nigeria</p>
                    <p><strong>Working Hours:</strong> Mon – Sat, 8:00 AM – 6:00 PM</p>
                    <p><strong>Email:</strong> support@hitechd.com</p>
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs font-mono relative">
                    <MapPin className="w-8 h-8 text-[var(--rd)] mb-1" />
                    <span>6 Airport Road Map coordinates</span>
                    <span className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1 rounded">Delta State</span>
                  </div>
                </div>

                <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-2">
                  <h4 className="font-bold text-sm text-[var(--yl)] border-b border-slate-800 pb-2">📦 Delivery & Logistics</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">We support standard door-to-door secure delivery across Warri, Sapele, Benin City, and nationwide shipping. Deliveries inside Warri are dispatched same-day!</p>
                </div>
              </motion.div>
            )}

            {/* Diagnostics Desk Room (Repairs) */}
            {currentRoom === "repair" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <Teleprompter text="Welcome to the Diagnostics Desk! Submit a repair request for your device. Fill in the form below, and our repairs team (Ruth) will contact you within 24 hours. You can track your repair status using your ticket number." />
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-[var(--rd)] font-bold text-base flex items-center gap-2">
                    <Wrench className="w-5 h-5" /> Diagnostics & Repair Desk
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Request repair diagnostics. Our AI system suggests fault categories and repair complexity instantly!</p>
                </div>

                {/* Sub-view switches */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <button onClick={() => setTrackResult(null)} className={`py-1.5 text-xs font-bold rounded ${!trackResult ? "bg-slate-800 text-[var(--yl)]" : "text-slate-400"}`}>
                    Submit Request
                  </button>
                  <button onClick={() => setTrackResult(repairs[0] || null)} className={`py-1.5 text-xs font-bold rounded ${trackResult ? "bg-slate-800 text-[var(--yl)]" : "text-slate-400"}`}>
                    Track Repair
                  </button>
                </div>

                {!trackResult ? (
                  <form onSubmit={submitRepairDesk} className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Device Details</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select value={repairDeviceType} onChange={(e) => setRepairDeviceType(e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none">
                        <option value="Laptop">Laptop</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Printer">Printer</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Other">Other Device</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Brand & Model"
                        value={repairBrandModel}
                        onChange={(e) => setRepairBrandModel(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none"
                      />
                    </div>

                    <textarea
                      placeholder="Detailed Fault Description (e.g. laptop won't boot, screen flickers, printer has paper jam)"
                      value={repairProblem}
                      onChange={(e) => setRepairProblem(e.target.value)}
                      rows={3}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono mt-2">Customer Details</p>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={repairCustName}
                      onChange={(e) => setRepairCustName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />
                    <input
                      type="text"
                      placeholder="Your Phone Number"
                      value={repairCustPhone}
                      onChange={(e) => setRepairCustPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none w-full"
                    />

                    <button
                      type="submit"
                      disabled={submittingRepair}
                      className="w-full py-3 mt-2 bg-gradient-to-r from-[var(--rd2)] to-[var(--rd)] text-xs font-bold text-white uppercase tracking-wider rounded-lg shadow-md"
                    >
                      {submittingRepair ? "Evaluating Triage..." : "Register Repair Desk →"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    <form onSubmit={handleTrackRepair} className="p-3 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex gap-2">
                      <input
                        type="text"
                        placeholder="Reference Code, e.g. HT-2026-101"
                        value={trackRef}
                        onChange={(e) => setTrackRef(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 flex-grow outline-none font-mono"
                      />
                      <button type="submit" className="px-4 py-2 bg-[var(--bl)] hover:bg-blue-600 text-xs text-white rounded-lg font-bold">
                        Track
                      </button>
                    </form>

                    {trackError && <p className="text-xs text-red-400 font-mono text-center">{trackError}</p>}

                    {trackResult && (
                      <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">{trackResult.ref}</span>
                          <span className="text-xs text-[var(--yl)] font-bold">{trackResult.status}</span>
                        </div>

                        <div className="text-xs font-mono text-slate-400 flex flex-col gap-1.5 border-b border-slate-800/80 pb-3">
                          <p><strong>Client:</strong> {trackResult.name}</p>
                          <p><strong>Device:</strong> {trackResult.type} ({trackResult.brand})</p>
                          <p><strong>Problem:</strong> "{trackResult.problem}"</p>
                        </div>

                        {/* AI Triage Information Block */}
                        {trackResult.aiCategory && (
                          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-xs">
                            <p className="font-bold text-red-400 flex items-center gap-1 mb-1">
                              <Info className="w-3.5 h-3.5" /> AI Assist Triage Diagnostic Recommendation
                            </p>
                            <p className="text-slate-300"><strong>Classified Fault:</strong> {trackResult.aiCategory}</p>
                            <p className="text-slate-300"><strong>Complexity estimate:</strong> {trackResult.aiComplexity}</p>
                          </div>
                        )}

                        {/* Progress Stepper */}
                        <div>
                          <p className="text-[10px] uppercase font-mono tracking-wider text-[var(--mu)] mb-3">Repair Progress Steps</p>
                          <div className="flex justify-between items-center px-2 relative">
                            {/* Connector line */}
                            <div className="absolute top-2.5 left-6 right-6 h-[2px] bg-slate-800 z-0" />
                            {["Received", "Diagnosed", "Sent Away", "In Repair", "Returned", "Ready for Pickup"].map((stg, i) => (
                              <div key={stg} className="flex flex-col items-center z-10 relative">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${getStageDotClass(trackResult.status, stg, i, ["Received", "Diagnosed", "Sent Away", "In Repair", "Returned", "Ready for Pickup"])}`} />
                                <span className="text-[7px] text-slate-500 uppercase tracking-tighter mt-1">{stg.slice(0, 7)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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
                <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)]">
                  <h3 className="text-blue-400 font-bold text-base flex items-center gap-2">
                    <Network className="w-5 h-5" /> Communication Channels
                  </h3>
                  <p className="text-xs text-[var(--mu)]">Quick direct contact cards for Sales, Solar queries, general support, and technical staff.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Support Desk", channel: "WhatsApp General", icon: <Wrench className="w-5 h-5 text-red-500" />, desc: "Report issues, parts lookup, or software warranty", wa: WA_GEN },
                    { title: "Solar Projects", channel: "WhatsApp Solar", icon: <Sun className="w-5 h-5 text-amber-500 animate-pulse" />, desc: "Solar batteries, design inquiries, site assessment", wa: WA_SALES },
                    { title: "Wholesale & bulk", channel: "WhatsApp Sales", icon: <ShoppingCart className="w-5 h-5 text-blue-500" />, desc: "Bulk corporate office hardware procurement", wa: WA_SALES },
                    { title: "Inventory", channel: "WhatsApp Stock", icon: <FolderPlus className="w-5 h-5 text-purple-400" />, desc: "Check accessories, cables and specific model specs", wa: WA_INVENTORY }
                  ].map((chan, idx) => (
                    <div key={idx} className="p-3 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col justify-between h-[150px]">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          {chan.icon}
                          <h4 className="font-bold text-xs text-[var(--cr)]">{chan.title}</h4>
                        </div>
                        <p className="text-[10px] text-[var(--mu)] leading-relaxed">{chan.desc}</p>
                      </div>
                      <button
                        onClick={() => window.open(`https://wa.me/${chan.wa}?text=Hello, I have an inquiry about ${chan.title.toLowerCase()}`, "_blank")}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white rounded"
                      >
                        Message Channel
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
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${msg.sender === "user" ? "bg-[var(--bl2)] text-white" : "bg-[var(--dk2)] text-slate-200 border border-slate-800"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="p-2.5 rounded-xl bg-[var(--dk2)] border border-slate-800 flex items-center gap-1 text-[10px] text-[var(--mu)]">
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
                <div className="p-6 bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter flex items-center gap-2 mb-2">
                    <Sun className="w-6 h-6 text-amber-500" /> Solar Infrastructure
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Configure hybrid backup installations, batteries, panels, and chargers.</p>
                </div>

                <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
                  <h4 className="font-black text-sm text-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-black" /> AI Sizing Engine
                  </h4>
                  <p className="text-[11px] font-serif italic text-slate-700 mb-6">Input your daily appliances and average running hours, and the AI Core will automatically compute your ideal inverter, battery, and solar panel array.</p>

                  <div className="flex flex-col gap-3 bg-slate-100 p-4 border-2 border-black">
                    {sizingAppliances.map(app => (
                      <div key={app.id} className="flex justify-between items-center text-xs border-b border-dashed border-black pb-3 mb-1">
                        <div>
                          <p className="font-bold text-black uppercase">{app.name}</p>
                          <p className="text-[10px] text-slate-600 font-mono tracking-widest">{app.watts}W • {app.hours} hrs</p>
                        </div>
                        <div className="flex items-center bg-white border-2 border-black font-bold">
                          <button onClick={() => updateApplianceCount(app.id, -1)} className="p-1.5 text-black hover:bg-black hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="px-3 font-mono text-black">{app.count}</span>
                          <button onClick={() => updateApplianceCount(app.id, 1)} className="p-1.5 text-black hover:bg-black hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSizingRecommendation}
                      disabled={sizingLoading}
                      className="w-full py-3 mt-4 bg-black hover:bg-white hover:text-black border-2 border-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
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
                              className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col gap-4">
                    <h4 className="font-black text-xs text-black uppercase tracking-widest border-b-4 border-black pb-2">Deployment Specifications</h4>
                    <div className="text-xs font-mono text-black flex flex-col gap-2 bg-slate-100 border-2 border-black p-4">
                      <p><strong className="uppercase">Total Daily Load:</strong> {sizingRecommendation.totalLoadWh} Wh</p>
                      <div className="border-t border-dashed border-black my-2"></div>
                      <p className="text-black"><strong className="uppercase">Inverter Core:</strong> {sizingRecommendation.recommendedInverter?.name} ({sizingRecommendation.recommendedInverter?.price})</p>
                      <p className="text-black"><strong className="uppercase">Battery Storage:</strong> {sizingRecommendation.recommendedBattery?.name} ({sizingRecommendation.recommendedBattery?.price})</p>
                      <p className="text-black"><strong className="uppercase">Solar Array:</strong> {sizingRecommendation.recommendedPanels?.quantity}x {sizingRecommendation.recommendedPanels?.name} ({sizingRecommendation.recommendedPanels?.price} ea)</p>
                    </div>
                    <div className="text-[11px] text-slate-800 leading-relaxed font-serif italic border-l-4 border-black pl-3 my-2">
                      <p><strong>System Note:</strong> {sizingRecommendation.reasoning}</p>
                    </div>
                    <button
                      onClick={() => {
                        const message = `Hello, I ran the Solar Sizing tool. Recommended setup:\nInverter: ${sizingRecommendation.recommendedInverter?.name}\nBattery: ${sizingRecommendation.recommendedBattery?.name}\nPanels: ${sizingRecommendation.recommendedPanels?.quantity}x ${sizingRecommendation.recommendedPanels?.name}`;
                        window.open(`https://wa.me/${WA_SALES}?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                      className="w-full py-3 bg-black border-2 border-black text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs transition-colors"
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
                      className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 outline-none font-mono text-[10px] w-full"
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
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-3 outline-none"
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

                {/* Data Table */}
                <div className="bg-slate-900 rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[9px] uppercase tracking-wider text-[var(--mu)]">
                          <th className="p-3 font-medium">ROW</th>
                          <th className="p-3 font-medium">DISPLAY ORDER</th>
                          <th className="p-3 font-medium">BRAND</th>
                          <th className="p-3 font-medium">PRODUCT CODE</th>
                          <th className="p-3 font-medium">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] text-slate-300">
                        {products.filter(p => !sheetSearch || p.n.toLowerCase().includes(sheetSearch.toLowerCase()) || p.pn?.toLowerCase().includes(sheetSearch.toLowerCase())).map((p, index) => (
                          <tr key={p.id} onClick={() => setEditingProduct(p)} className="border-b border-slate-800/50 hover:bg-slate-800/30 group cursor-pointer">
                            <td className="p-3 font-mono">{index + 1}</td>
                            <td className="p-3 font-mono">{index + 1}</td>
                            <td className="p-3 uppercase">{p.n.split(" ")[0]}</td>
                            <td className="p-3 font-mono text-[var(--yl)]">{p.pn || "—"}</td>
                            <td className="p-3 flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-blue-400" title="Edit Row">
                                📝
                              </button>
                              <button onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-red-400" title="Delete Row">
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                      { label: "Display Order", val: products.findIndex(p => p.id === editingProduct.id) + 1 },
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
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2.5 outline-none font-mono"
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
                            onClick={() => { setCurrentPreset(preset as any); localStorage.setItem("ht_preset", preset); }}
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
                              localStorage.setItem("ht_storefront_image", e.target.value);
                            }}
                            placeholder="Paste image URL here..."
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] text-[var(--cr)] rounded p-1.5 outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Upload button */}
                      <div className="flex flex-col gap-2">
                        <label className={`w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer bg-slate-950/40 text-[var(--cr)] transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {isUploading ? "Uploading..." : "Upload Photo from Device"}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleStorefrontPhotoUpload} 
                          />
                        </label>
                        {uploadStatus && (
                          <p className={`text-[10px] font-mono text-center ${uploadStatus.toLowerCase().includes("error") ? "text-red-400" : "text-emerald-400"}`}>
                            {uploadStatus}
                          </p>
                        )}
                      </div>

                      {/* Preset Buttons */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-[9px] font-mono text-[var(--mu)] uppercase">Quick Select Presets:</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const img = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
                              setStorefrontImage(img);
                              localStorage.setItem("ht_storefront_image", img);
                              setUploadStatus("Selected premium storefront preset!");
                            }}
                            className="py-1 px-2.5 bg-slate-950 hover:bg-slate-900 text-left rounded text-[10px] border border-slate-800 font-mono text-slate-300 truncate cursor-pointer"
                          >
                            🏢 Flagship Building Facade (Unsplash)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const img = "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80";
                              setStorefrontImage(img);
                              localStorage.setItem("ht_storefront_image", img);
                              setUploadStatus("Selected clean showroom preset!");
                            }}
                            className="py-1 px-2.5 bg-slate-950 hover:bg-slate-900 text-left rounded text-[10px] border border-slate-800 font-mono text-slate-300 truncate cursor-pointer"
                          >
                            💻 Tech Showroom Interior (Unsplash)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const img = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80";
                              setStorefrontImage(img);
                              localStorage.setItem("ht_storefront_image", img);
                              setUploadStatus("Selected tech devices preset!");
                            }}
                            className="py-1 px-2.5 bg-slate-950 hover:bg-slate-900 text-left rounded text-[10px] border border-slate-800 font-mono text-slate-300 truncate cursor-pointer"
                          >
                            🔌 Modern Devices Preset (Unsplash)
                          </button>
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
                        <div className="text-xs font-mono text-[#1a1a2e]">₦400,000</div>
                      </div>
                      <div className="flex-1 border border-[#e8f0fe] p-2 text-center bg-white rounded">
                        <div className="text-[10px] text-[#555555] font-bold mb-1 uppercase">Select Product</div>
                        <div className="font-black text-xs text-[#1a3a6b]">HP 250 G8</div>
                        <div className="text-xs font-mono text-[#1a1a2e]">₦750,000</div>
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
                            <div className="text-[10px] font-mono text-[#555555]">{compareProduct1.price}</div>
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
                                  <span className="font-mono text-[10px] text-[#1a73e8]">{p.price}</span>
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
                            <div className="text-[10px] font-mono text-[#555555]">{compareProduct2.price}</div>
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
                                  <span className="font-mono text-[10px] text-[#1a73e8]">{p.price}</span>
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
                          {compareProduct1.imgFront || compareProduct1.imgManual ? (
                            <img src={compareProduct1.imgManual || compareProduct1.imgFront} alt={compareProduct1.n} className="w-full h-full object-contain" />
                          ) : (
                            <Box className="w-10 h-10 text-slate-300" />
                          )}
                        </div>
                        <h4 className="font-black text-xs text-[#1a3a6b] leading-tight mb-1 min-h-[30px] line-clamp-2">{compareProduct1.n}</h4>
                        <div className="text-sm font-mono font-bold text-[#1a1a2e] border-b border-[#e8f0fe] pb-2 mb-2">{compareProduct1.price}</div>
                        
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
                          {compareProduct2.imgFront || compareProduct2.imgManual ? (
                            <img src={compareProduct2.imgManual || compareProduct2.imgFront} alt={compareProduct2.n} className="w-full h-full object-contain" />
                          ) : (
                            <Box className="w-10 h-10 text-slate-300" />
                          )}
                        </div>
                        <h4 className="font-black text-xs text-[#1a3a6b] leading-tight mb-1 min-h-[30px] line-clamp-2">{compareProduct2.n}</h4>
                        <div className="text-sm font-mono font-bold text-[#1a1a2e] border-b border-[#e8f0fe] pb-2 mb-2">{compareProduct2.price}</div>
                        
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
                  </div>
                )}
              </motion.div>
            )}

          </main>

          {/* 3.5 Bottom Navigation - Fixed bottom bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--dk)]/95 backdrop-blur-md border-t-4 border-black overflow-x-auto">
            <div className="flex justify-between items-center px-2 py-1 max-w-[430px] mx-auto min-w-[430px]">
              {[
                { id: "showroom", label: "Show", icon: <Building className="w-4 h-4" /> },
                { id: "display", label: "Display", icon: <Tv className="w-4 h-4" /> },
                { id: "deals", label: "Deals", icon: <Tag className="w-4 h-4" /> },
                { id: "livesheet", label: "Prices", icon: <FileText className="w-4 h-4" /> },
                { id: "gallery", label: "Gallery", icon: <Camera className="w-4 h-4" /> },
                { id: "video", label: "Videos", icon: <Video className="w-4 h-4" /> },
                { id: "invoice", label: "Invoice", icon: <ShoppingCart className="w-4 h-4" /> },
                { id: "operational", label: "Ops", icon: <MapPin className="w-4 h-4" /> },
                { id: "repair", label: "Repair", icon: <Wrench className="w-4 h-4" /> },
                { id: "channels", label: "Channels", icon: <Network className="w-4 h-4" /> },
                { id: "info", label: "AI", icon: <MessageSquare className="w-4 h-4" /> },
                { id: "contact", label: "Contact", icon: <Mail className="w-4 h-4" /> },
                { id: "feedback", label: "Review", icon: <Star className="w-4 h-4" /> },
                { id: "pickup", label: "Pickup", icon: <Calendar className="w-4 h-4" /> },
                { id: "staff", label: "Staff", icon: <Lock className="w-4 h-4" /> },
                { id: "sheets", label: "Sheets", icon: <Database className="w-4 h-4" /> },
                { id: "compare", label: "Compare", icon: <GitCompare className="w-4 h-4" /> }
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

      {/* Slide-Up Product Detail Overlay */}
      <ProductDetailOverlay 
        selectedProduct={selectedProduct} 
        setSelectedProduct={setSelectedProduct}
        products={products}
        setProducts={setProducts}
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
