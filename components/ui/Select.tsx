"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      {...rest}
      className={cn(
        "glass-input w-full h-11 rounded-xl border px-3.5 text-sm outline-none transition-all",
        "focus:ring-2 focus:ring-brand/30 focus:border-brand",
        invalid ? "border-rose-400" : "border-white/60",
        className,
      )}
    >
      {children}
    </select>
  );
});
