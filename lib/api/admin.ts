import { api } from "./client";
import type {
  User,
  Vendor,
  PaginatedResponse,
  KycOverridePayload,
  RadioBatchUploadPayload,
  RadioSingleUploadPayload,
  EbookAdvanceReviewPayload,
  EmbedKeyCreatePayload,
  EmbedKeyCreateResponse,
  EmbedKeyRevokePayload,
} from "./types";
import { listRadioTracks, uploadRadioBatch, uploadRadioTrack } from "./radio";

export async function listUsers(page?: number, pageSize?: number) {
  return api<PaginatedResponse<User>>("/api/v1/admin/users", {
    params: { page, pageSize },
  });
}

export async function listVendors(page?: number, pageSize?: number) {
  return api<PaginatedResponse<Vendor>>("/api/v1/admin/vendors", {
    params: { page, pageSize },
  });
}

export async function overrideKyc(payload: KycOverridePayload) {
  return api<void>("/api/v1/admin/vendor/kyc-override", {
    method: "POST",
    body: payload,
  });
}

export async function listAdminRadioTracks() {
  return listRadioTracks();
}

export async function uploadAdminRadioTrack(
  payload: RadioSingleUploadPayload,
  onProgress?: (percent: number) => void,
) {
  return uploadRadioTrack(payload, onProgress);
}

export async function uploadAdminRadioBatch(
  payload: RadioBatchUploadPayload,
  onProgress?: (percent: number) => void,
) {
  return uploadRadioBatch(payload, onProgress);
}

export async function reviewEbookAdvance(payload: EbookAdvanceReviewPayload) {
  return api<void>("/api/v1/ebook/advance/review", {
    method: "POST",
    body: payload,
  });
}

export async function createEmbedKey(payload: EmbedKeyCreatePayload) {
  return api<EmbedKeyCreateResponse>("/api/v1/admin/embed-key/create", {
    method: "POST",
    body: payload,
  });
}

export async function revokeEmbedKey(payload: EmbedKeyRevokePayload) {
  return api<void>("/api/v1/admin/embed-key/revoke", {
    method: "POST",
    body: payload,
  });
}
