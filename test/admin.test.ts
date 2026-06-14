import { describe, it, expect } from "vitest";
import {
  listUsers,
  listVendors,
  overrideKyc,
  reviewEbookAdvance,
  createEmbedKey,
  revokeEmbedKey,
} from "@/lib/api/admin";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("admin module", () => {
  it("listUsers GETs /admin/users with pagination params", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { items: [{ id: "u1" }], total: 1, page: 1, page_size: 20 } });

    const res = await listUsers(1, 20);

    const req = lastRequest();
    expect(pathOf(req)).toContain("/api/v1/admin/users?");
    expect(pathOf(req)).toContain("page=1");
    expect(pathOf(req)).toContain("pageSize=20");
    expect(req.headers["Authorization"]).toBe("Bearer admin-tok");
    expect(res.total).toBe(1);
  });

  it("listVendors GETs /admin/vendors", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { items: [], total: 0, page: 1, page_size: 20 } });

    await listVendors();

    expect(pathOf()).toContain("/api/v1/admin/vendors");
  });

  it("overrideKyc POSTs vendor_id + kyc_status to the override route", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 200, body: {} });

    await overrideKyc({ vendor_id: "vend-1", kyc_status: "verified" });

    expect(pathOf()).toBe("/api/v1/admin/vendor/kyc-override");
    expect(jsonBody()).toEqual({ vendor_id: "vend-1", kyc_status: "verified" });
  });

  it("reviewEbookAdvance POSTs the decision", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 200, body: {} });

    await reviewEbookAdvance({ request_id: "req-1", decision: "approve", reason: "ok" });

    expect(pathOf()).toBe("/api/v1/ebook/advance/review");
    expect(jsonBody()).toMatchObject({ request_id: "req-1", decision: "approve" });
  });

  it("createEmbedKey POSTs tenant details and returns the embed key", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 201, body: { embed_key: "ek_123", tenant_name: "BlogXYZ", usage: "..." } });

    const res = await createEmbedKey({ tenant_name: "BlogXYZ", domain: "https://blogxyz.com" });

    expect(pathOf()).toBe("/api/v1/admin/embed-key/create");
    expect(res.embed_key).toBe("ek_123");
  });

  it("revokeEmbedKey POSTs the embed key", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 200, body: {} });

    await revokeEmbedKey({ embed_key: "ek_123" });

    expect(pathOf()).toBe("/api/v1/admin/embed-key/revoke");
    expect(jsonBody()).toEqual({ embed_key: "ek_123" });
  });
});
