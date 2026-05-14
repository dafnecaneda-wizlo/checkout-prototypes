import type { CheckoutValues } from "./schema/fields";
import { FIELDS, isFieldVisible, type FieldDef, type Step } from "./schema/fields";

export type ValidationErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-\+\(\)]{7,}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\s?\/\s?(\d{2}|\d{4})$/;
const CVC_RE = /^\d{3,4}$/;

function validateField(field: FieldDef, value: unknown): string | null {
  if (field.required) {
    if (value === undefined || value === null || value === "" || value === false) {
      return "Required";
    }
  }
  if (!value) return null;

  switch (field.type) {
    case "email":
      return EMAIL_RE.test(String(value)) ? null : "Enter a valid email";
    case "tel":
      return PHONE_RE.test(String(value)) ? null : "Enter a valid phone";
    case "card": {
      const digits = String(value).replace(/\s+/g, "");
      return digits.length >= 13 && digits.length <= 19 ? null : "Card looks off";
    }
    case "expiry":
      return EXPIRY_RE.test(String(value)) ? null : "Use MM / YY";
    case "cvc":
      return CVC_RE.test(String(value)) ? null : "3 or 4 digits";
    default:
      return null;
  }
}

export function validateAll(values: CheckoutValues): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const field of FIELDS) {
    if (!isFieldVisible(field, values)) continue;
    const err = validateField(field, values[field.id]);
    if (err) errors[field.id] = err;
  }
  return errors;
}

export function validateStep(
  values: CheckoutValues,
  step: Step,
): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const field of FIELDS.filter((f) => f.step === step)) {
    if (!isFieldVisible(field, values)) continue;
    const err = validateField(field, values[field.id]);
    if (err) errors[field.id] = err;
  }
  return errors;
}
