/**
 * Client-side checkout mock. The prototype is shipped as a static export
 * (Azure SWA) so there is no API route at runtime. This module mirrors
 * the response shape of the old POST /api/checkout handler.
 */
import { mockPaymentAdapter } from "@/lib/payment/adapter";

export async function placeMockOrder(input: {
  variant: string;
  totalCents: number;
  email: string;
}) {
  return mockPaymentAdapter.charge({
    amountCents: input.totalCents,
    currency: "USD",
    customerEmail: input.email,
    description: `Wizlo order via ${input.variant}`,
  });
}
