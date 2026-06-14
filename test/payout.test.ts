import { describe, it, expect } from "vitest";
import { requestPayout, getPayoutStatus } from "@/lib/api/payout";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("payout module", () => {
  it("requestPayout POSTs bank details to /payout/request", async () => {
    setAuthToken("p-tok");
    mockResponse({ status: 200, body: {} });

    await requestPayout({ amount: 75000, bank_code: "058", account_number: "0123456789", account_name: "Ada Eze" });

    expect(pathOf()).toBe("/api/v1/payout/request");
    expect(jsonBody()).toMatchObject({ amount: 75000, bank_code: "058" });
  });

  it("getPayoutStatus GETs with the payout_id query", async () => {
    setAuthToken("p-tok");
    mockResponse({ body: { payout_id: "po1", status: "paid", amount: 75000 } });

    const res = await getPayoutStatus("po1");

    expect(lastRequest().method).toBe("GET");
    expect(pathOf()).toBe("/api/v1/payout/get?payout_id=po1");
    expect(res.status).toBe("paid");
  });
});
