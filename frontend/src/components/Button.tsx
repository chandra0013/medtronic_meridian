"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: LucideIcon;
}

export function Button({
  className,
  variant = "primary",
  icon: Icon,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-apex-forest text-white hover:bg-apex-forest/90",
    secondary: "bg-apex-mint-light text-apex-forest hover:bg-apex-mint",
    outline: "border-2 border-apex-forest text-apex-forest hover:bg-apex-forest hover:text-white",
    ghost: "text-apex-forest hover:bg-apex-forest/5",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={20} strokeWidth={2} />}
      {children}
    </motion.button>
  );
}
