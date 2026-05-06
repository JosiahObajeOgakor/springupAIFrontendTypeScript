import { api } from "./client";
import type {
  KycPresignPayload,
  KycPresignResponse,
  KycSubmitPayload,
  KycStatusResponse,
} from "./types";

export async function getKycPresignUrl(payload: KycPresignPayload) {
  return api<KycPresignResponse>("/api/v1/vendor/kyc/presign", {
    method: "POST",
    body: payload,
  });
}

export async function submitKyc(payload: KycSubmitPayload) {
  return api<void>("/api/v1/vendor/kyc/submit", {
    method: "POST",
    body: payload,
  });
}

export async function getKycStatus(vendorId: string) {
  return api<KycStatusResponse>(`/api/v1/vendor/kyc/status?vendorId=${encodeURIComponent(vendorId)}`);
}
