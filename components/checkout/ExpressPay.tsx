"use client";

import { useEffect, useState } from "react";
import { mockPaymentAdapter } from "@/lib/payment/adapter";
import { cn } from "@/lib/utils";

type Method = "apple" | "google" | "shop";

const LABELS: Record<Method, string> = {
  apple: " Pay",
  google: "G Pay",
  shop: "shop Pay",
};

const STYLES: Record<Method, string> = {
  apple: "bg-black text-white hover:bg-slate-900",
  google: "bg-slate-900 text-white hover:bg-slate-800",
  shop: "bg-violet-600 text-white hover:bg-violet-700",
};

export function ExpressPay({
  onPay,
}: {
  onPay?: (method: Method) => void;
}) {
  const [methods, setMethods] = useState<Method[]>([]);

  useEffect(() => {
    mockPaymentAdapter.availableExpressMethods().then((m) => setMethods(m as Method[]));
  }, []);

  if (methods.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onPay?.(m)}
            className={cn(
              "h-11 rounded-lg text-sm font-semibold transition-colors",
              STYLES[m],
            )}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400 py-1">
        <span className="flex-1 h-px bg-slate-200" />
        <span>or pay with card</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>
    </div>
  );
}
