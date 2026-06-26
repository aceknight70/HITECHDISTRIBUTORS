import React from "react";
import { motion } from "motion/react";
import { Laptop, Printer, Box, Search } from "lucide-react";
import { Product } from "../data/catalog";

interface GalleryCardProps {
  product: Product;
  index: number;
  total: number;
  onView: (p: Product) => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ product, index, total, onView }) => {
  try {
    if (!product) return null;

    const brand = product.brand || "HITECH";
    const categoryName = product.cat || "Product";
    const displayName = product.n || "Product Name";
    const imageUrl = product.imgManual || product.imgFront;
    
    // Determine price display
    const priceDisplay = product.price && product.price !== "CALL" 
      ? (product.price.includes("₦") ? product.price : `₦${product.price}`)
      : "Price on Request";

    // Determine badge
    let badgeText = "";
    let badgeColor = "";
    if (product.newp) {
      badgeText = "NEW";
      badgeColor = "bg-[#10b981] text-white"; // Green
    } else if (product.promo) {
      badgeText = "POPULAR";
      badgeColor = "bg-[#f59e0b] text-white"; // Orange
    } else if (product.price && product.price !== "CALL") {
      badgeText = "HOT DEAL";
      badgeColor = "bg-[#dc3545] text-white"; // Red
    }

    return (
      <motion.div
        className="bg-white border-2 border-slate-900 rounded-xl overflow-hidden flex flex-col relative shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] cursor-pointer group hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all"
        onClick={() => onView(product)}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      >
        {/* Top bar with Image Counter and Badge */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
            {index + 1} of {total}
          </span>
          {badgeText && (
            <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase shadow-sm ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Gallery Image Container */}
        <div className="w-full h-[200px] bg-white border-b-2 border-slate-200 relative overflow-hidden flex items-center justify-center p-4">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={displayName}
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-slate-300 flex flex-col items-center gap-2">
              {product.cat === "laptops" ? (
                <Laptop className="w-16 h-16" />
              ) : product.cat === "printers" ? (
                <Printer className="w-16 h-16" />
              ) : (
                <Box className="w-16 h-16" />
              )}
              <span className="text-[10px] font-mono tracking-wider uppercase opacity-60">No Image Preview</span>
            </div>
          )}

          {/* Hover Zoom & Inspection Icon */}
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <motion.div
              className="bg-slate-900 text-white rounded-full p-2.5 shadow-lg flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              animate={ { scale: 1 } }
            >
              <Search className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </motion.div>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-4 flex-grow flex flex-col justify-between bg-white text-slate-900">
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono font-black tracking-wider text-slate-500 uppercase">
                {brand}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-mono font-black tracking-wider text-blue-600 uppercase">
                {categoryName}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
              {displayName}
            </h3>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
            <span className="price text-sm font-bold font-mono text-[#1a1a2e]">
              {priceDisplay}
            </span>
            <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
              Click to View details
            </span>
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error("Error rendering GalleryCard:", error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-mono">
        Failed to load this gallery image safely.
      </div>
    );
  }
};
