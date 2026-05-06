import { api } from "./client";
import type {
  EscrowOpenPayload,
  EscrowResponse,
  EscrowIdPayload,
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

export async function refundEscrow(payload: EscrowIdPayload) {
  return api<void>("/api/v1/escrow/refund", {
    method: "POST",
    body: payload,
  });
}

export async function getEscrow(escrowId: string) {
  return api<EscrowResponse>("/api/v1/escrow/get", {
    params: { escrow_id: escrowId },
  });
}
