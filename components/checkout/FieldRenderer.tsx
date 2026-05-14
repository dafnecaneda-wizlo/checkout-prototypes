"use client";

import type { FieldDef } from "@/lib/schema/fields";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { VariantId } from "@/lib/analytics/adapter";
import { track } from "@/lib/analytics/client";

interface FieldRendererProps {
  field: FieldDef;
  value: string | boolean | undefined;
  error?: string;
  variant: VariantId;
  onChange: (value: string | boolean) => void;
}

export function FieldRenderer({
  field,
  value,
  error,
  variant,
  onChange,
}: FieldRendererProps) {
  const labelEl = (
    <label
      htmlFor={field.id}
      className="block text-sm font-medium text-slate-800 mb-1.5"
    >
      {field.label}
      {!field.required && (
        <span className="text-slate-400 font-normal ml-1">(optional)</span>
      )}
      {field.telehealthStub && (
        <span
          className="ml-2 inline-block text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded"
          title="Placement to be confirmed by Johnny"
        >
          telehealth stub
        </span>
      )}
    </label>
  );

  const helpEl = field.helpText && !error && (
    <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
  );

  const errorEl = error && (
    <p className="text-xs text-rose-600 mt-1">{error}</p>
  );

  const trackFocus = () =>
    track({ kind: "field_focus", variant, fieldId: field.id });
  const trackBlur = (val: string | boolean) =>
    track({
      kind: "field_blur",
      variant,
      fieldId: field.id,
      hasValue: Boolean(val),
    });

  if (field.type === "checkbox") {
    return (
      <div className="flex items-start gap-2.5 py-1">
        <input
          id={field.id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          onFocus={trackFocus}
          onBlur={(e) => trackBlur(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
        />
        <label htmlFor={field.id} className="text-sm text-slate-700">
          {field.label}
          {field.telehealthStub && (
            <span className="ml-2 inline-block text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              telehealth stub
            </span>
          )}
        </label>
      </div>
    );
  }

  if (field.type === "address") {
    return (
      <div className={cn(error && "field-error-shake")}>
        {labelEl}
        <div className="grid gap-2">
          <Input
            id={field.id}
            placeholder="Street address"
            autoComplete="street-address"
            value={String(value ?? "")}
            invalid={Boolean(error)}
            onChange={(e) => onChange(e.target.value)}
            onFocus={trackFocus}
            onBlur={(e) => trackBlur(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="City" autoComplete="address-level2" />
            <Input placeholder="State" autoComplete="address-level1" />
            <Input placeholder="ZIP" autoComplete="postal-code" />
          </div>
        </div>
        {helpEl}
        {errorEl}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={cn(error && "field-error-shake")}>
        {labelEl}
        <Select
          id={field.id}
          value={String(value ?? "")}
          invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={trackFocus}
          onBlur={(e) => trackBlur(e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {helpEl}
        {errorEl}
      </div>
    );
  }

  const inputType =
    field.type === "tel"
      ? "tel"
      : field.type === "email"
      ? "email"
      : "text";

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  return (
    <div className={cn(error && "field-error-shake")}>
      {labelEl}
      <Input
        id={field.id}
        type={inputType}
        placeholder={field.placeholder}
        autoComplete={field.autocomplete}
        value={String(value ?? "")}
        invalid={Boolean(error)}
        maxLength={field.type === "expiry" ? 7 : undefined}
        onChange={(e) => {
          if (field.type === "expiry") {
            onChange(formatExpiry(e.target.value));
          } else if (field.type === "cvc") {
            onChange(e.target.value.replace(/\D/g, "").slice(0, 4));
          } else {
            onChange(e.target.value);
          }
        }}
        onFocus={trackFocus}
        onBlur={(e) => trackBlur(e.target.value)}
        inputMode={
          field.type === "card" || field.type === "cvc" || field.type === "expiry"
            ? "numeric"
            : undefined
        }
      />
      {helpEl}
      {errorEl}
    </div>
  );
}
