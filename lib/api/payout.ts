import { api } from "./client";
import type {
  PayoutRequestPayload,
  PayoutStatusResponse,
  PayoutApprovePayload,
  PayoutCompletePayload,
  PayoutFailPayload,
} from "./types";

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

export async function approvePayout(payload: PayoutApprovePayload) {
  return api<void>("/api/v1/payout/approve", { method: "POST", body: payload });
}

export async function completePayout(payload: PayoutCompletePayload) {
  return api<void>("/api/v1/payout/complete", { method: "POST", body: payload });
}

export async function failPayout(payload: PayoutFailPayload) {
  return api<void>("/api/v1/payout/fail", { method: "POST", body: payload });
}
