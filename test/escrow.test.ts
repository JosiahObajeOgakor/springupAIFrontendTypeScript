import { describe, it, expect } from "vitest";
import {
  openEscrow,
  markEscrowFunded,
  startService,
  confirmEscrow,
  refundEscrow,
  getEscrow,
} from "@/lib/api/escrow";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("escrow module", () => {
  it("openEscrow POSTs the escrow request and returns the escrow record", async () => {
    setAuthToken("es-tok");
    mockResponse({ body: { escrow_id: "es1", status: "open", amount: 30000, currency: "NGN", vendor_id: "v1" } });

    const res = await openEscrow({ vendor_id: "v1", amount: 30000, currency: "NGN", description: "AC fix" });

    expect(pathOf()).toBe("/api/v1/escrow/open");
    expect(jsonBody()).toMatchObject({ vendor_id: "v1", amount: 30000 });
    expect(res.escrow_id).toBe("es1");
  });

  it("escrow lifecycle routes each POST the escrow_id", async () => {
    setAuthToken("es-tok");
    const cases: Array<[() => Promise<unknown>, string]> = [
      [() => markEscrowFunded({ escrow_id: "es1" }), "/api/v1/escrow/mark-funded"],
      [() => startService({ escrow_id: "es1" }), "/api/v1/escrow/start-service"],
      [() => confirmEscrow({ escrow_id: "es1" }), "/api/v1/escrow/confirm"],
      [() => refundEscrow({ escrow_id: "es1" }), "/api/v1/escrow/refund"],
    ];

    for (const [call, path] of cases) {
      mockResponse({ status: 200, body: {} });
      await call();
      expect(pathOf()).toBe(path);
      expect(jsonBody()).toEqual({ escrow_id: "es1" });
    }
  });

  it("getEscrow GETs with the escrow_id query", async () => {
    setAuthToken("es-tok");
    mockResponse({ body: { escrow_id: "es1", status: "open", amount: 30000, currency: "NGN", vendor_id: "v1" } });

    await getEscrow("es1");

    expect(lastRequest().method).toBe("GET");
    expect(pathOf()).toBe("/api/v1/escrow/get?escrow_id=es1");
  });
});
