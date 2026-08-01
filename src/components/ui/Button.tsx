import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export default function Button({ children, variant = 'primary', fullWidth = false, className = '', ...props }: ButtonProps) {
  
  const baseStyles = "relative font-bold text-sm md:text-base uppercase tracking-widest py-4 px-8 rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#D4AF37] text-black hover:bg-[#F5F5F5] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(245,245,245,0.5)]",
    secondary: "bg-[#171717] text-white hover:bg-[#2a2a2a] border border-white/10",
    outline: "bg-transparent text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37]/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children as React.ReactNode}</span>
    </motion.button>
  );
}
