import { describe, it, expect } from "vitest";
import {
  registerVendor,
  vendorLogin,
  getVendorServices,
  createService,
  applyForTier,
  checkPlan,
  updateVendorProfile,
  contactVendor,
} from "@/lib/api/vendor";
import { store } from "@/lib/store";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

const vendorBody = (over = {}) => ({
  id: "vend-1",
  user_id: "u1",
  name: "Cool AC",
  category: "Air Conditioning",
  location: "Ikeja",
  verified: false,
  kyc_status: "pending",
  ...over,
});

describe("vendor module", () => {
  it("registerVendor POSTs to /vendor/register-by-phone (no auth), normalizes phone, and stores credentials", async () => {
    mockResponse({
      status: 201,
      body: { token: "v-tok", vendor: vendorBody(), user_id: "u1", vendor_unique: "08010000000" },
    });

    const res = await registerVendor({
      phone: "0801",
      name: "Cool AC",
      category: "Air Conditioning",
      location: "Ikeja",
    });

    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/vendor/register-by-phone");
    expect(req.headers["Authorization"]).toBeUndefined();
    expect(res.vendor.id).toBe("vend-1");
    expect(store.getState().auth.vendorId).toBe("vend-1");
    expect(store.getState().auth.token).toBe("v-tok");
  });

  it("registerVendor passes optional referral_code and extra fields through", async () => {
    mockResponse({ status: 201, body: { token: "v-tok2", vendor: vendorBody({ id: "vend-2" }), user_id: "u2" } });

    await registerVendor({
      phone: "0802",
      name: "Jane Braids",
      category: "Braiding",
      location: "Yaba",
      referral_code: "REF123",
    });

    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/vendor/register-by-phone");
    expect(jsonBody(req)).toMatchObject({ phone: "0802", referral_code: "REF123" });
    expect(store.getState().auth.vendorId).toBe("vend-2");
  });

  it("vendorLogin POSTs phone and stores the returned vendor_id", async () => {
    mockResponse({ body: { token: "login-tok", vendor_id: "vend-9", user: { id: "u9", name: "X", phone: "0803" } } });

    await vendorLogin("0803");

    expect(pathOf()).toBe("/api/v1/vendor/login");
    expect(jsonBody()).toEqual({ phone: "0803" });
    expect(store.getState().auth.vendorId).toBe("vend-9");
  });

  it("getVendorServices GETs /vendor/services with vendorId query", async () => {
    setAuthToken("v-tok");
    mockResponse({ body: [{ id: "s1", vendor_id: "vend-1", title: "Repair", description: "", price: 5000, available: true }] });

    const services = await getVendorServices("vend-1");

    const req = lastRequest();
    expect(req.method).toBe("GET");
    expect(pathOf(req)).toBe("/api/v1/vendor/services?vendorId=vend-1");
    expect(services[0].title).toBe("Repair");
  });

  it("createService POSTs to /vendor/services/create", async () => {
    setAuthToken("v-tok");
    mockResponse({ status: 201, body: {} });

    await createService({ vendor_id: "vend-1", title: "Deep clean", description: "", price: 12000 });

    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/vendor/services/create");
    expect(jsonBody(req)).toMatchObject({ vendor_id: "vend-1", price: 12000 });
  });

  it("applyForTier POSTs the tier application and returns the Paystack init payload", async () => {
    setAuthToken("v-tok");
    mockResponse({
      status: 201,
      body: { payment_id: "pay-1", authorization_url: "https://paystack/checkout", status: "pending" },
    });

    const res = await applyForTier({ vendor_id: "vend-1", tier_level: "tier_1", email: "v@x.com" });

    expect(pathOf()).toBe("/api/v1/vendor/tier/apply");
    expect(jsonBody()).toMatchObject({ vendor_id: "vend-1", tier_level: "tier_1" });
    expect(res.authorization_url).toContain("paystack");
  });

  it("checkPlan GETs /vendor/plan/check with vendorId query", async () => {
    setAuthToken("v-tok");
    mockResponse({ body: { active: true, plan: "tier_1", tier_status: "active", expires_at: "2026-12-01T00:00:00Z" } });

    const res = await checkPlan("vend-1");

    expect(pathOf()).toBe("/api/v1/vendor/plan/check?vendorId=vend-1");
    expect(res.active).toBe(true);
  });

  it("updateVendorProfile PATCHes /vendor/update with profile fields incl. bio", async () => {
    setAuthToken("v-tok");
    mockResponse({ body: { id: "vend-1", user_id: "u1", name: "New name", category: "AC", location: "Ikeja", verified: false, kyc_status: "pending" } });
    await updateVendorProfile({ name: "New name", bio: "10 years fixing ACs" });
    expect(lastRequest().method).toBe("PATCH");
    expect(pathOf()).toBe("/api/v1/vendor/update");
    expect(jsonBody()).toMatchObject({ name: "New name", bio: "10 years fixing ACs" });
  });

  it("contactVendor POSTs /vendor/contact", async () => {
    setAuthToken("v-tok");
    mockResponse({ status: 200, body: {} });
    await contactVendor({ vendor_id: "vend-1", message: "Hi" });
    expect(lastRequest().method).toBe("POST");
    expect(pathOf()).toBe("/api/v1/vendor/contact");
    expect(jsonBody()).toEqual({ vendor_id: "vend-1", message: "Hi" });
  });
});
