/**
 * Eligibility adapter. Wizlo telehealth needs insurance / HSA / FSA / state-level
 * Rx rules at some point in the funnel. Where exactly is Johnny's call.
 *
 * For now this is a stub that always returns eligible. Swap to a real
 * eligibility service later by implementing the same interface.
 */

export interface EligibilityRequest {
  insuranceProvider?: string;
  state?: string;
  productSku: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  estimatedCoverageCents?: number;
}

export interface EligibilityAdapter {
  check(req: EligibilityRequest): Promise<EligibilityResult>;
}

export const mockEligibilityAdapter: EligibilityAdapter = {
  async check() {
    await new Promise((r) => setTimeout(r, 200));
    return { eligible: true };
  },
};
