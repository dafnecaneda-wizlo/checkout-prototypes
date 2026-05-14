"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        size === "md" && "h-10 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" &&
          "bg-gradient-to-br from-brand to-savings text-white shadow-card hover:shadow-cardLift hover:-translate-y-0.5",
        variant === "secondary" &&
          "glass border border-white/60 text-slate-900 hover:text-brand-ink",
        variant === "ghost" &&
          "text-slate-700 hover:bg-white/40 hover:text-brand-ink",
        className,
      )}
    />
  );
}
