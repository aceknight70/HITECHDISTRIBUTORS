import React from "react";
import { motion } from "motion/react";

interface HitechLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const HitechLogo: React.FC<HitechLogoProps> = ({ size = "md", className = "" }) => {
  // Define sizes
  const sizes = {
    sm: {
      hi: "px-1.5 py-0.5 rounded text-[11px] md:text-xs font-black tracking-wide",
      tech: "px-1.5 py-0.5 rounded text-[11px] md:text-xs font-black tracking-wide",
      hub: "text-[11px] md:text-xs tracking-wider font-mono font-bold",
      gap: "gap-1"
    },
    md: {
      hi: "px-2 py-1 rounded-md text-base font-black tracking-wide",
      tech: "px-2 py-1 rounded-md text-base font-black tracking-wide",
      hub: "text-sm tracking-widest font-mono font-bold",
      gap: "gap-1.5"
    },
    lg: {
      hi: "px-3 py-1.5 rounded-lg text-2xl md:text-3xl font-black tracking-wide",
      tech: "px-3 py-1.5 rounded-lg text-2xl md:text-3xl font-black tracking-wide",
      hub: "text-xl md:text-2xl tracking-[0.15em] font-mono font-bold",
      gap: "gap-2.5"
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
      className={`inline-flex items-center select-none font-sans ${currentSize.gap} ${className}`}
    >
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

      {/* HUB */}
      <motion.span
        variants={itemVariants}
        className={`${currentSize.hub} text-[#0f172a] dark:text-white uppercase flex items-center gap-1.5`}
        whileHover={{ letterSpacing: "0.2em" }}
        transition={{ duration: 0.25 }}
      >
        HUB
        <motion.span
          className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#10b981] inline-block shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.span>
    </motion.div>
  );
};
