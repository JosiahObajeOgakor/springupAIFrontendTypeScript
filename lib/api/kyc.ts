import { api } from "./client";
import type {
  KycPresignPayload,
  KycPresignResponse,
  KycSubmitPayload,
  KycSubmitResponse,
  KycStatusResponse,
  KycDocumentResponse,
} from "./types";

export async function getKycPresignUrl(payload: KycPresignPayload) {
  // Spec: the gateway reads vendor_id + type from the JSON body; query params
  // are ignored on this route. Returns a short-lived presigned S3 PUT URL.
  return api<KycPresignResponse>("/api/v1/vendor/kyc/presign", {
    method: "POST",
    body: payload,
  });
}

export async function submitKyc(payload: KycSubmitPayload) {
  // Starts the ₦5,000 verification charge backend-side. Returns immediately with
  // status "payment_pending"; the vendor is verified later via the Paystack
  // webhook. Provide at least one of nin/bvn.
  return api<KycSubmitResponse>("/api/v1/vendor/kyc/submit", {
    method: "POST",
    body: payload,
  });
}

export async function getKycStatus(vendorId?: string) {
  // vendorId is optional — the gateway resolves it from the authenticated vendor
  // when omitted.
  return api<KycStatusResponse>("/api/v1/vendor/kyc/status", {
    params: vendorId ? { vendorId } : undefined,
  });
}

export async function getKycDocument(vendorId: string, type: string) {
  // Presigned GET URL for the stored 512x512 ID image.
  return api<KycDocumentResponse>("/api/v1/vendor/kyc/document", {
    params: { vendor_id: vendorId, type },
  });
}
