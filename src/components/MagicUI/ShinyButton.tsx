"use client";

import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/utils";

const animationProps: MotionProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as MotionProps;

interface ShinyButtonProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative flex items-center justify-center cursor-pointer rounded-full border border-white/50 px-8 py-3 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow-lg",
        "bg-[#e2e8f0]", // Hardcoded light grey background (matches screenshot)
        "hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]", // White glow
        className
      )}
      {...animationProps}
      {...props}
    >
      <span
        className="relative flex items-center justify-center text-sm tracking-wide uppercase text-slate-900 font-bold whitespace-nowrap"
        style={{
          maskImage:
            "linear-gradient(-75deg,#0f172a calc(var(--x) + 20%),rgba(15,23,42,0.5) calc(var(--x) + 30%),#0f172a calc(var(--x) + 100%))",
          WebkitMaskImage:
            "linear-gradient(-75deg,#0f172a calc(var(--x) + 20%),rgba(15,23,42,0.5) calc(var(--x) + 30%),#0f172a calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,rgba(255,255,255,0.1) calc(var(--x)+20%),rgba(255,255,255,0.8) calc(var(--x)+25%),rgba(255,255,255,0.1) calc(var(--x)+100%))",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";
