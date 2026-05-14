export interface CartLine {
  id: string;
  name: string;
  description: string;
  quantityLabel: string;
  unitCents: number;
  /** Cadence label shown in the order summary, e.g. "Monthly", "3 month bundle" */
  cadence?: string;
  /** Display-only dosage line, surfaced under the product name */
  dosage?: string;
  /** When set, the line renders a strike-through original price + savings */
  originalCents?: number;
}

export interface Cart {
  lines: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: "USD";
}

export const SAMPLE_CART: Cart = {
  lines: [
    {
      id: "sema-3mo",
      name: "Semaglutide weight management",
      description: "Compounded GLP-1. Provider supervised.",
      quantityLabel: "3 month bundle",
      cadence: "3 month bundle. Save 15%",
      dosage: "0.25 mg weekly, titrating to 1 mg",
      unitCents: 76500,
      originalCents: 90000,
    },
    {
      id: "consult",
      name: "Provider consultation",
      description: "Async visit + Rx review",
      quantityLabel: "One time",
      unitCents: 0,
    },
  ],
  subtotalCents: 76500,
  shippingCents: 0,
  taxCents: 6120,
  totalCents: 82620,
  currency: "USD",
};
