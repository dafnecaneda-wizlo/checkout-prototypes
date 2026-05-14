"use client";

import { useState } from "react";
import { PREFILLED_SHIPPING } from "@/lib/schema/fields";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/**
 * Read-only shipping address summary. The address is captured upfront
 * in the intake form (Pratik's May 12 call). Clicking Edit reveals
 * inline editable fields without ever leaving the checkout page
 * (Johnny's May 13 constraint: "we never want to take them off the
 * checkout page for any reason").
 */
export function PrefilledShipping() {
  const [editing, setEditing] = useState(false);
  const [addr, setAddr] = useState({ ...PREFILLED_SHIPPING });

  if (editing) {
    return (
      <div className="rounded-xl glass-dim border border-white/40 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600 font-semibold">
            Edit shipping address
          </p>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs font-medium text-brand-ink hover:underline"
          >
            Done
          </button>
        </div>
        <Input
          value={addr.name}
          onChange={(e) => setAddr({ ...addr, name: e.target.value })}
          placeholder="Full name"
          autoComplete="name"
        />
        <Input
          value={addr.line1}
          onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
          placeholder="Street address"
          autoComplete="address-line1"
        />
        <Input
          value={addr.line2}
          onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
          placeholder="Apt, suite (optional)"
          autoComplete="address-line2"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={addr.city}
            onChange={(e) => setAddr({ ...addr, city: e.target.value })}
            placeholder="City"
            autoComplete="address-level2"
          />
          <div className="grid grid-cols-[1fr_1fr] gap-2">
            <Input
              value={addr.state}
              onChange={(e) => setAddr({ ...addr, state: e.target.value })}
              placeholder="State"
              autoComplete="address-level1"
              maxLength={2}
            />
            <Input
              value={addr.postal}
              onChange={(e) => setAddr({ ...addr, postal: e.target.value })}
              placeholder="ZIP"
              autoComplete="postal-code"
            />
          </div>
        </div>
        <Select
          value={addr.country}
          onChange={(e) => setAddr({ ...addr, country: e.target.value })}
        >
          <option>Portugal</option>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
        </Select>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-dim border border-white/40 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600 font-semibold">
            Ships to
          </p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {addr.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-brand-ink hover:underline"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-slate-600 leading-snug">
        {addr.line1}
        {addr.line2 ? `, ${addr.line2}` : ""}
        <br />
        {addr.city}, {addr.state} {addr.postal}
        <br />
        {addr.country}
      </p>
    </div>
  );
}
