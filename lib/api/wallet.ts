import { api } from "./client";
import type {
  WalletFundPayload,
  WalletFundResponse,
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
