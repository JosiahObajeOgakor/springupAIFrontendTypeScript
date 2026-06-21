import { api } from "./client";
import type {
  EscrowOpenPayload,
  EscrowResponse,
  EscrowIdPayload,
  EscrowConfirmSatisfactionPayload,
  EscrowDisputePayload,
  EscrowStatusResponse,
} from "./types";

export async function openEscrow(payload: EscrowOpenPayload) {
  return api<EscrowResponse>("/api/v1/escrow/open", {
    method: "POST",
    body: payload,
  });
}

export async function markEscrowFunded(payload: EscrowIdPayload) {
  return api<void>("/api/v1/escrow/mark-funded", {
    method: "POST",
    body: payload,
  });
}

export async function startService(payload: EscrowIdPayload) {
  return api<void>("/api/v1/escrow/start-service", {
    method: "POST",
    body: payload,
  });
}

export async function confirmEscrow(payload: EscrowIdPayload) {
  return api<void>("/api/v1/escrow/confirm", {
    method: "POST",
    body: payload,
  });
}

// NOTE: /api/v1/escrow/refund does NOT exist in the spec.
// The wallet-level refund (used for job_id-based escrow) is at /api/v1/wallet/refund.
// This function is kept for callers but routes to the correct endpoint.
export async function refundEscrow(payload: EscrowIdPayload) {
  return api<void>("/api/v1/wallet/refund", {
    method: "POST",
    body: { job_id: payload.escrow_id },
  });
}

export async function getEscrow(escrowId: string) {
  return api<EscrowResponse>("/api/v1/escrow/get", {
    params: { escrow_id: escrowId },
  });
}

export async function getEscrowStatus(escrowId: string) {
  return api<EscrowStatusResponse>("/api/v1/escrow/status", {
    params: { escrow_id: escrowId },
  });
}

export async function confirmSatisfaction(payload: EscrowConfirmSatisfactionPayload) {
  return api<void>("/api/v1/escrow/confirm-satisfaction", {
    method: "POST",
    body: payload,
  });
}

export async function raiseDispute(payload: EscrowDisputePayload) {
  return api<void>("/api/v1/escrow/dispute", {
    method: "POST",
    body: payload,
  });
}
