/**
 * Shared field schema. All variants render from this.
 *
 * May 12 changes (Johnny):
 * - Insurance fields removed. Wizlo does not use insurance.
 * - Shipping address dropped from checkout. Captured upfront in the intake
 *   form (Pratik's call). Checkout pre-fills from intake. See PREFILLED_SHIPPING.
 * - Billing address defaults to "same as shipping". Unchecking exposes
 *   alternate billing fields.
 * - HSA/FSA stub kept until Johnny confirms placement.
 */

export type FieldType =
  | "email"
  | "text"
  | "tel"
  | "select"
  | "checkbox"
  | "address"
  | "card"
  | "expiry"
  | "cvc";

export type Step = "contact" | "shipping" | "billing" | "payment" | "review";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  step: Step;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  autocomplete?: string;
  options?: { value: string; label: string }[];
  /** Telehealth-flagged fields are stubs until Johnny confirms placement */
  telehealthStub?: boolean;
  /** Only render this field when another field has the given value */
  showWhen?: { fieldId: string; equals: string | boolean };
}

/**
 * Address captured in intake. Checkout reads this, does not re-collect it.
 * Editing is exposed via an "Edit" link that bounces back to intake in prod.
 */
export const PREFILLED_SHIPPING = {
  name: "Dafne Caneda",
  line1: "742 Evergreen Terrace",
  line2: "Apt 3B",
  city: "Lisbon",
  state: "LI",
  postal: "1100-001",
  country: "Portugal",
};

export const FIELDS: FieldDef[] = [
  {
    id: "email",
    label: "Email",
    type: "email",
    step: "contact",
    required: true,
    placeholder: "you@example.com",
    autocomplete: "email",
    helpText: "Order confirmation and tracking get sent here.",
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    step: "contact",
    required: false,
    placeholder: "(555) 555-5555",
    autocomplete: "tel",
    helpText: "Optional. For shipping updates by SMS.",
  },
  {
    id: "marketingOptIn",
    label: "Email me about new treatments and offers",
    type: "checkbox",
    step: "contact",
    required: false,
  },

  {
    id: "shippingMethod",
    label: "Shipping method",
    type: "select",
    step: "shipping",
    required: true,
    options: [
      { value: "standard", label: "Standard (5 to 7 days) Free" },
      { value: "expedited", label: "Expedited (2 to 3 days) $9.99" },
      { value: "overnight", label: "Overnight $24.99" },
    ],
  },
  {
    id: "billingSameAsShipping",
    label: "Use this address for billing too",
    type: "checkbox",
    step: "shipping",
    required: false,
  },

  {
    id: "paymentMethod",
    label: "Payment method",
    type: "select",
    step: "payment",
    required: true,
    options: [
      { value: "card", label: "Credit or debit card" },
      { value: "affirm", label: "Affirm. 4 interest-free payments" },
      { value: "applepay", label: "Apple Pay" },
      { value: "googlepay", label: "Google Pay" },
    ],
  },
  {
    id: "cardNumber",
    label: "Card number",
    type: "card",
    step: "payment",
    required: true,
    placeholder: "1234 1234 1234 1234",
    autocomplete: "cc-number",
    showWhen: { fieldId: "paymentMethod", equals: "card" },
  },
  {
    id: "cardExpiry",
    label: "Expiration",
    type: "expiry",
    step: "payment",
    required: true,
    placeholder: "MM / YY",
    autocomplete: "cc-exp",
    showWhen: { fieldId: "paymentMethod", equals: "card" },
  },
  {
    id: "cardCvc",
    label: "CVC",
    type: "cvc",
    step: "payment",
    required: true,
    placeholder: "CVC",
    autocomplete: "cc-csc",
    showWhen: { fieldId: "paymentMethod", equals: "card" },
  },
  {
    id: "billingAddress",
    label: "Billing address",
    type: "address",
    step: "billing",
    required: true,
    autocomplete: "billing street-address",
    showWhen: { fieldId: "billingSameAsShipping", equals: false },
  },
  {
    id: "hsaFsa",
    label: "Pay with HSA / FSA card",
    type: "checkbox",
    step: "payment",
    required: false,
    telehealthStub: true,
  },
];

export const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "billing", label: "Billing" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function fieldsByStep(step: Step): FieldDef[] {
  return FIELDS.filter((f) => f.step === step);
}

export type CheckoutValues = Record<string, string | boolean | undefined>;

export function emptyValues(): CheckoutValues {
  return FIELDS.reduce<CheckoutValues>((acc, f) => {
    if (f.id === "billingSameAsShipping") {
      acc[f.id] = true;
    } else if (f.id === "paymentMethod") {
      acc[f.id] = "card";
    } else {
      acc[f.id] = f.type === "checkbox" ? false : "";
    }
    return acc;
  }, {});
}

export function isFieldVisible(field: FieldDef, values: CheckoutValues): boolean {
  if (!field.showWhen) return true;
  return values[field.showWhen.fieldId] === field.showWhen.equals;
}
