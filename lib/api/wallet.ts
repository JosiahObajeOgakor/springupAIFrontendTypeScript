import { api } from "./client";
import type {
  WalletFundPayload,
  WalletFundResponse,
  WalletEscrowPayload,
  WalletReleasePayload,
  WalletRefundPayload,
  VirtualAccountPayload,
  InternalTransferPayload,
  WalletWithdrawPayload,
} from "./types";

export async function fundWallet(payload: WalletFundPayload) {
  return api<WalletFundResponse>("/api/v1/wallet/fund", {
    method: "POST",
    body: payload,
  });
}

export async function holdEscrow(payload: WalletEscrowPayload) {
  return api<void>("/api/v1/wallet/escrow", {
    method: "POST",
    body: payload,
  });
}

export async function releaseEscrow(payload: WalletReleasePayload) {
  return api<void>("/api/v1/wallet/release", {
    method: "POST",
    body: payload,
  });
}

export async function refundFromEscrow(payload: WalletRefundPayload) {
  return api<void>("/api/v1/wallet/refund", {
    method: "POST",
    body: payload,
  });
}

export async function createVirtualAccount(payload: VirtualAccountPayload) {
  return api<void>("/api/v1/wallet/virtual-account", {
    method: "POST",
    body: payload,
  });
}

export async function internalTransfer(payload: InternalTransferPayload) {
  return api<void>("/api/v1/wallet/transfer/internal", {
    method: "POST",
    body: payload,
  });
}

export async function withdraw(payload: WalletWithdrawPayload) {
  return api<void>("/api/v1/wallet/withdraw", {
    method: "POST",
    body: payload,
  });
}
