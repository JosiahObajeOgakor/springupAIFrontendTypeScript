import { api } from "./client";
import type { PayoutRequestPayload, PayoutStatusResponse } from "./types";

export async function requestPayout(payload: PayoutRequestPayload) {
  return api<void>("/api/v1/payout/request", {
    method: "POST",
    body: payload,
  });
}

export async function getPayoutStatus(payoutId: string) {
  return api<PayoutStatusResponse>("/api/v1/payout/get", {
    params: { payout_id: payoutId },
  });
}
