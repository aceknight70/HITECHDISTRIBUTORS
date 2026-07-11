import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface HitechLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const HitechLogo: React.FC<HitechLogoProps> = ({ size = "md", className = "" }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const localLogo = localStorage.getItem("ht_company_logo");
    if (localLogo) {
      setLogoUrl(localLogo);
    }

    const handleStorageChange = () => {
      const updatedLogo = localStorage.getItem("ht_company_logo");
      setLogoUrl(updatedLogo);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ht_logo_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ht_logo_updated", handleStorageChange);
    };
  }, []);

  if (logoUrl) {
    const imgHeight = size === "sm" ? "h-6" : size === "md" ? "h-10" : "h-16";
    return (
      <div className={`inline-flex flex-col select-none ${className}`}>
        <img 
          src={logoUrl} 
          alt="HiTech Logo" 
          className={`${imgHeight} object-contain rounded bg-slate-950/20`}
          onError={() => {
            // Remove broken link and fallback to CSS logo
            setLogoUrl(null);
          }}
        />
      </div>
    );
  }

  // Define sizes
  const sizes = {
    sm: {
      hi: "px-1.5 py-0.5 rounded text-[11px] md:text-xs font-black tracking-wide",
      tech: "px-1.5 py-0.5 rounded text-[11px] md:text-xs font-black tracking-wide",
      d: "px-1.5 py-0.5 rounded text-[11px] md:text-xs font-black tracking-wide",
      hub: "px-1.5 py-0.5 rounded bg-[#1a1a2e] text-[11px] md:text-xs tracking-wider font-mono font-bold text-white",
      gap: "gap-1",
      sub: "text-[7px] md:text-[8px] tracking-[0.2em] font-bold text-slate-400 mt-0.5 uppercase"
    },
    md: {
      hi: "px-2 py-1 rounded-md text-base font-black tracking-wide",
      tech: "px-2 py-1 rounded-md text-base font-black tracking-wide",
      d: "px-2 py-1 rounded-md text-base font-black tracking-wide",
      hub: "px-2 py-1 rounded-md bg-[#1a1a2e] text-sm tracking-widest font-mono font-bold text-white",
      gap: "gap-1.5",
      sub: "text-[9px] md:text-[10px] tracking-[0.2em] font-bold text-slate-400 mt-1 uppercase"
    },
    lg: {
      hi: "px-3 py-1.5 rounded-lg text-2xl md:text-3xl font-black tracking-wide",
      tech: "px-3 py-1.5 rounded-lg text-2xl md:text-3xl font-black tracking-wide",
      d: "px-3 py-1.5 rounded-lg text-2xl md:text-3xl font-black tracking-wide",
      hub: "px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-xl md:text-2xl tracking-[0.15em] font-mono font-bold text-white",
      gap: "gap-2.5",
      sub: "text-xs md:text-sm tracking-[0.2em] font-bold text-slate-400 mt-1.5 uppercase"
    }
  };

  const currentSize = sizes[size] || sizes.md;

  // Variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0, scale: 0.95 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 140,
        damping: 14
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-flex flex-col select-none font-sans ${className}`}
    >
      <div className={`flex items-center ${currentSize.gap}`}>
        {/* HI */}
        <motion.span
          variants={itemVariants}
          className={`${currentSize.hi} bg-[#dc3545] text-white shadow-[0_0_12px_rgba(220,53,69,0.35)]`}
          whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
          animate={{
            boxShadow: [
              "0 0 10px rgba(220,53,69,0.3)",
              "0 0 18px rgba(220,53,69,0.6)",
              "0 0 10px rgba(220,53,69,0.3)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          HI
        </motion.span>

        {/* TECH */}
        <motion.span
          variants={itemVariants}
          className={`${currentSize.tech} bg-[#1a73e8] text-white shadow-[0_0_12px_rgba(26,115,232,0.35)]`}
          whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
          animate={{
            boxShadow: [
              "0 0 10px rgba(26,115,232,0.3)",
              "0 0 18px rgba(26,115,232,0.6)",
              "0 0 10px rgba(26,115,232,0.3)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }
          }}
        >
          TECH
        </motion.span>

        {/* D */}
        <motion.span
          variants={itemVariants}
          className={`${currentSize.d} bg-[#28a745] text-white shadow-[0_0_12px_rgba(40,167,69,0.35)]`}
          whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
          animate={{
            boxShadow: [
              "0 0 10px rgba(40,167,69,0.3)",
              "0 0 18px rgba(40,167,69,0.6)",
              "0 0 10px rgba(40,167,69,0.3)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }
          }}
        >
          D
        </motion.span>

        {/* HUB */}
        <motion.span
          variants={itemVariants}
          className={`${currentSize.hub} uppercase flex items-center justify-center`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.25 }}
        >
          HUB
        </motion.span>
      </div>
      
      {/* FULL NAME */}
      <motion.span 
        variants={itemVariants}
        className={currentSize.sub}
      >
        HiTech Distributors
      </motion.span>
    </motion.div>
  );
};

