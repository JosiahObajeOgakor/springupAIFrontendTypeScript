import { api } from "./client";
import { store } from "@/lib/store";
import { setCredentials } from "@/lib/store/authSlice";
import { normalizePhone } from "@/lib/phone";
import type {
  VendorRegisterPayload,
  VendorRegisterResponse,
  VendorLoginResponse,
  VendorUpdatePayload,
  VendorContactPayload,
  VendorProfile,
  Vendor,
  VendorService,
  CreateServicePayload,
  TierApplyPayload,
  TierApplyResponse,
  PlanCheckResponse,
  VendorPlan,
} from "./types";

export async function registerVendor(payload: VendorRegisterPayload) {
  const res = await api<VendorRegisterResponse>("/api/v1/vendor/register-by-phone", {
    method: "POST",
    body: { ...payload, phone: normalizePhone(payload.phone) },
    noAuth: true,
  });
  const vendorId = res.vendor?.id ?? (res as any).vendor_id ?? res.user_id ?? '';
  store.dispatch(setCredentials({
    token: res.token,
    vendorId,
    vendor: res.vendor as unknown as Record<string, unknown>,
  }));
  return res;
}

export async function vendorLogin(phone: string) {
  const res = await api<VendorLoginResponse>("/api/v1/vendor/login", {
    method: "POST",
    body: { phone: normalizePhone(phone) },
    noAuth: true,
  });
  const vendorId = res.vendor_id ?? (res as any).vendor?.id ?? '';
  store.dispatch(setCredentials({
    token: res.token,
    vendorId,
  }));
  return res;
}

// PATCH /api/v1/vendor/update — update the authenticated vendor's profile.
export async function updateVendorProfile(payload: VendorUpdatePayload) {
  return api<Vendor>("/api/v1/vendor/update", {
    method: "PATCH",
    body: payload,
  });
}

// POST /api/v1/vendor/contact — send a message to a vendor.
export async function contactVendor(payload: VendorContactPayload) {
  return api<void>("/api/v1/vendor/contact", {
    method: "POST",
    body: payload,
  });
}

// GET /api/v1/vendor/profile — public profile card (trust signals, KYC status).
export async function getVendorProfile(vendorId: string) {
  return api<VendorProfile>("/api/v1/vendor/profile", {
    params: { vendor_id: vendorId },
  });
}

export async function getVendorServices(vendorId: string) {
  return api<VendorService[]>("/api/v1/vendor/services", {
    params: { vendorId },
  });
}

export async function createService(payload: CreateServicePayload) {
  return api<void>("/api/v1/vendor/services/create", {
    method: "POST",
    body: payload,
  });
}

export async function applyForTier(payload: TierApplyPayload) {
  return api<TierApplyResponse>("/api/v1/vendor/tier/apply", {
    method: "POST",
    body: payload,
  });
}

export async function checkPlan(vendorId: string) {
  return api<PlanCheckResponse>("/api/v1/vendor/plan/check", {
    params: { vendorId },
  });
}

export async function getVendorPlans() {
  return api<VendorPlan[]>("/api/v1/vendor/plans", {
    method: "GET",
  });
}

// POST /api/v1/vendor/materials/upload — upload delivery material for a job.
export async function uploadVendorMaterials(payload: import('./types').VendorMaterialsUploadPayload) {
  return api<void>("/api/v1/vendor/materials/upload", {
    method: "POST",
    body: payload,
  });
}

// POST /api/v1/vendor/materials/confirm — vendor confirms material delivery.
export async function confirmVendorDelivery(payload: import('./types').VendorMaterialsConfirmPayload) {
  return api<void>("/api/v1/vendor/materials/confirm", {
    method: "POST",
    body: payload,
  });
}
