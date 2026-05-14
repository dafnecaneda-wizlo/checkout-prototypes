/**
 * Payment adapter. Mocked for prototype. Swap to Stripe later by
 * implementing the same interface against PaymentIntents.
 */

export interface PaymentRequest {
  amountCents: number;
  currency: "USD";
  customerEmail: string;
  description: string;
}

export interface PaymentResult {
  ok: boolean;
  receiptId?: string;
  error?: string;
}

export interface PaymentAdapter {
  charge(req: PaymentRequest): Promise<PaymentResult>;
  /** Express pay availability. Stripe equivalent: paymentRequest.canMakePayment() */
  availableExpressMethods(): Promise<("apple" | "google" | "shop")[]>;
}

export const mockPaymentAdapter: PaymentAdapter = {
  async charge(req) {
    await new Promise((r) => setTimeout(r, 700));
    if (req.amountCents <= 0) {
      return { ok: false, error: "Invalid amount" };
    }
    return {
      ok: true,
      receiptId: `rcpt_mock_${Math.random().toString(36).slice(2, 10)}`,
    };
  },
  async availableExpressMethods() {
    // In prototype we render all three buttons so reviewers see the pattern.
    return ["apple", "google", "shop"];
  },
};
