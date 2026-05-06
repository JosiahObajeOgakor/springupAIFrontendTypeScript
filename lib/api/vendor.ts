import { api, setToken } from "./client";
import type {
  VendorRegisterPayload,
  VendorRegisterResponse,
  VendorRegisterByPhonePayload,
  VendorRegisterByPhoneResponse,
  VendorLoginResponse,
  VendorUpdatePayload,
  VendorContactPayload,
  VendorService,
  CreateServicePayload,
  TierApplyPayload,
  TierApplyResponse,
  PlanCheckResponse,
} from "./types";

export async function registerVendor(payload: VendorRegisterPayload) {
  const res = await api<VendorRegisterResponse>("/api/v1/vendor/register", {
    method: "POST",
    body: payload,
    noAuth: true,
  });
  setToken(res.token);
  localStorage.setItem("vendor", JSON.stringify(res.vendor));
  localStorage.setItem("vendor_id", res.vendor.id);
  return res;
}

export async function registerVendorByPhone(payload: VendorRegisterByPhonePayload) {
  const res = await api<VendorRegisterByPhoneResponse>("/api/v1/vendor/register-by-phone", {
    method: "POST",
    body: payload,
    noAuth: true,
  });
  setToken(res.token);
  localStorage.setItem("vendor", JSON.stringify(res.vendor));
  localStorage.setItem("vendor_id", res.vendor.id);
  return res;
}

export async function vendorLogin(phone: string) {
  const res = await api<VendorLoginResponse>("/api/v1/vendor/login", {
    method: "POST",
    body: { phone },
    noAuth: true,
  });
  setToken(res.token);
  localStorage.setItem("vendor_id", res.vendor_id);
  return res;
}

export async function updateVendorProfile(payload: VendorUpdatePayload) {
  return api<void>("/api/v1/vendor/update", {
    method: "PATCH",
    body: payload,
  });
}

export async function contactVendor(payload: VendorContactPayload) {
  return api<void>("/api/v1/vendor/contact", {
    method: "POST",
    body: payload,
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
