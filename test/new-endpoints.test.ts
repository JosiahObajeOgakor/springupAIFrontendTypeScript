import { describe, it, expect } from "vitest";
import {
  getAdminDashboard,
  deleteUser,
  resolveDispute,
  suspendVendor,
  unsuspendVendor,
  approveVendor,
  getRevenueReport,
  getMlMetrics,
  createMlRule,
  updateMlRule,
  getEventLogs,
} from "@/lib/api/admin";
import {
  approvePayout,
  completePayout,
  failPayout,
} from "@/lib/api/payout";
import {
  confirmSatisfaction,
  raiseDispute,
  getEscrowStatus,
} from "@/lib/api/escrow";
import {
  searchFlights,
  bookFlight,
} from "@/lib/api/bills";
import { externalTransfer } from "@/lib/api/wallet";
import { enrichedSearch } from "@/lib/api/marketplace";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

// ─── Admin ────────────────────────────────────────────────────────────────────

describe("admin — new endpoints", () => {
  it("getAdminDashboard GETs /admin/dashboard", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { users: 42, vendors: 7 } });
    const res = await getAdminDashboard();
    expect(pathOf()).toBe("/api/v1/admin/dashboard");
    expect((res as Record<string, number>).users).toBe(42);
  });

  it("deleteUser sends DELETE with user_id query param", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 204, body: null });
    await deleteUser("u-xyz");
    const req = lastRequest();
    expect(req.method).toBe("DELETE");
    expect(pathOf(req)).toContain("/api/v1/admin/user");
    expect(pathOf(req)).toContain("user_id=u-xyz");
  });

  it("resolveDispute POSTs resolution details", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await resolveDispute({ escrow_id: "esc-1", resolution: "refund_user", notes: "buyer not satisfied" });
    expect(pathOf()).toBe("/api/v1/admin/dispute/resolve");
    expect(jsonBody()).toMatchObject({ escrow_id: "esc-1", resolution: "refund_user" });
  });

  it("suspendVendor POSTs vendor_id + reason", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await suspendVendor({ vendor_id: "vend-1", reason: "fraud" });
    expect(pathOf()).toBe("/api/v1/admin/vendor/suspend");
    expect(jsonBody()).toMatchObject({ vendor_id: "vend-1", reason: "fraud" });
  });

  it("unsuspendVendor POSTs vendor_id", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await unsuspendVendor({ vendor_id: "vend-1" });
    expect(pathOf()).toBe("/api/v1/admin/vendor/unsuspend");
    expect(jsonBody()).toMatchObject({ vendor_id: "vend-1" });
  });

  it("approveVendor POSTs approved:true", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await approveVendor({ vendor_id: "vend-1", approved: true });
    expect(pathOf()).toBe("/api/v1/admin/vendor/approve");
    expect(jsonBody()).toMatchObject({ vendor_id: "vend-1", approved: true });
  });

  it("getRevenueReport GETs /admin/reports/revenue", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { total: 1_000_000 } });
    await getRevenueReport();
    expect(pathOf()).toBe("/api/v1/admin/reports/revenue");
  });

  it("getMlMetrics GETs /admin/ml/metrics", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { accuracy: 0.98 } });
    await getMlMetrics();
    expect(pathOf()).toBe("/api/v1/admin/ml/metrics");
  });

  it("createMlRule POSTs rule fields", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 201, body: {} });
    await createMlRule({ rule_type: "spam", condition: "score > 0.9", action: "flag" });
    expect(pathOf()).toBe("/api/v1/admin/ml/rules");
    expect(lastRequest().method).toBe("POST");
    expect(jsonBody()).toMatchObject({ rule_type: "spam", condition: "score > 0.9" });
  });

  it("updateMlRule PATCHes rule fields", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await updateMlRule({ rule_id: "rule-1", action: "block" });
    expect(lastRequest().method).toBe("PATCH");
    expect(jsonBody()).toMatchObject({ rule_id: "rule-1", action: "block" });
  });

  it("getEventLogs GETs /admin/logs/events with optional date range", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { items: [] } });
    await getEventLogs({ from: "2026-01-01T00:00:00Z" });
    expect(pathOf()).toContain("/api/v1/admin/logs/events");
    expect(pathOf()).toContain("from=");
  });
});

// ─── Payout ───────────────────────────────────────────────────────────────────

describe("payout admin actions", () => {
  it("approvePayout POSTs payout_id", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await approvePayout({ payout_id: "pay-1" });
    expect(pathOf()).toBe("/api/v1/payout/approve");
    expect(jsonBody()).toMatchObject({ payout_id: "pay-1" });
  });

  it("completePayout POSTs payout_id + transfer_reference", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await completePayout({ payout_id: "pay-1", transfer_reference: "ref-xyz" });
    expect(pathOf()).toBe("/api/v1/payout/complete");
    expect(jsonBody()).toMatchObject({ payout_id: "pay-1", transfer_reference: "ref-xyz" });
  });

  it("failPayout POSTs payout_id + reason", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: {} });
    await failPayout({ payout_id: "pay-1", reason: "insufficient funds" });
    expect(pathOf()).toBe("/api/v1/payout/fail");
    expect(jsonBody()).toMatchObject({ reason: "insufficient funds" });
  });
});

// ─── Escrow ───────────────────────────────────────────────────────────────────

describe("escrow — new actions", () => {
  it("confirmSatisfaction POSTs rating and feedback", async () => {
    setAuthToken("tok");
    mockResponse({ body: {} });
    await confirmSatisfaction({ escrow_id: "esc-1", rating: 5, feedback: "great" });
    expect(pathOf()).toBe("/api/v1/escrow/confirm-satisfaction");
    expect(jsonBody()).toMatchObject({ escrow_id: "esc-1", rating: 5 });
  });

  it("raiseDispute POSTs reason", async () => {
    setAuthToken("tok");
    mockResponse({ body: {} });
    await raiseDispute({ escrow_id: "esc-1", reason: "vendor did not deliver" });
    expect(pathOf()).toBe("/api/v1/escrow/dispute");
    expect(jsonBody()).toMatchObject({ reason: "vendor did not deliver" });
  });

  it("getEscrowStatus GETs status with escrow_id param", async () => {
    setAuthToken("tok");
    mockResponse({ body: { escrow_id: "esc-1", status: "funded" } });
    const res = await getEscrowStatus("esc-1");
    expect(pathOf()).toContain("/api/v1/escrow/status");
    expect(pathOf()).toContain("escrow_id=esc-1");
    expect(res.status).toBe("funded");
  });
});

// ─── Bills / Flights ──────────────────────────────────────────────────────────

describe("bills — flights", () => {
  it("searchFlights GETs /bills/flights/search with required params", async () => {
    setAuthToken("tok");
    mockResponse({ body: { flights: [] } });
    await searchFlights({ origin: "LOS", destination: "ABV", date: "2026-07-01", passengers: 2 });
    const path = pathOf();
    expect(path).toContain("/api/v1/bills/flights/search");
    expect(path).toContain("origin=LOS");
    expect(path).toContain("destination=ABV");
  });

  it("bookFlight POSTs flight_id + passengers", async () => {
    setAuthToken("tok");
    mockResponse({ status: 201, body: {} });
    await bookFlight({ flight_id: "fl-123", passengers: [{ name: "John Doe", email: "j@x.com" }] });
    expect(pathOf()).toBe("/api/v1/bills/flights/book");
    expect(jsonBody()).toMatchObject({ flight_id: "fl-123" });
  });
});

// ─── Wallet external transfer ─────────────────────────────────────────────────

describe("wallet — externalTransfer", () => {
  it("externalTransfer POSTs to /wallet/transfer/external", async () => {
    setAuthToken("tok");
    mockResponse({ body: {} });
    await externalTransfer({ amount_kobo: 500000, bank_code: "044", account_number: "0123456789" });
    expect(pathOf()).toBe("/api/v1/wallet/transfer/external");
    expect(jsonBody()).toMatchObject({ amount_kobo: 500000, bank_code: "044" });
  });});

// ─── Marketplace enriched search ─────────────────────────────────────────────

describe("marketplace — enrichedSearch", () => {
  it("enrichedSearch POSTs to /marketplace/search/enriched", async () => {
    setAuthToken("tok");
    mockResponse({ body: { vendors: [] } });
    await enrichedSearch({ query: "plumber", location: "Lagos" });
    expect(pathOf()).toBe("/api/v1/marketplace/search/enriched");
    expect(jsonBody()).toMatchObject({ query: "plumber", location: "Lagos" });
  });
});
