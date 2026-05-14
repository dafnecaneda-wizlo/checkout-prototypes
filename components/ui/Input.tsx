"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "glass-input w-full h-11 rounded-xl border px-3.5 text-sm outline-none transition-all",
        "focus:ring-2 focus:ring-brand/30 focus:border-brand",
        invalid
          ? "border-rose-400 ring-1 ring-rose-200"
          : "border-white/60",
        className,
      )}
    />
  );
});
