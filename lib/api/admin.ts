import { api } from "./client";
import type {
  User,
  Vendor,
  PaginatedResponse,
  KycOverridePayload,
} from "./types";

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
