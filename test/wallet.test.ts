import { describe, it, expect } from "vitest";
import {
  fundWallet,
  holdEscrow,
  releaseEscrow,
  refundFromEscrow,
  withdraw,
} from "@/lib/api/wallet";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("wallet module", () => {
  it("fundWallet POSTs to /wallet/fund", async () => {
    setAuthToken("w-tok");
    mockResponse({ body: { authorization_url: "https://pay", reference: "ref-1" } });

    const res = await fundWallet({ owner_id: "u1", amount: 50000, provider: "paystack" });

    expect(pathOf()).toBe("/api/v1/wallet/fund");
    expect(jsonBody()).toMatchObject({ amount: 50000, provider: "paystack" });
    expect(res.reference).toBe("ref-1");
  });

  it("holdEscrow POSTs job + parties to /wallet/escrow", async () => {
    setAuthToken("w-tok");
    mockResponse({ status: 200, body: {} });

    await holdEscrow({ job_id: "j1", from_id: "u1", to_id: "v1", amount: 20000 });

    expect(pathOf()).toBe("/api/v1/wallet/escrow");
    expect(jsonBody()).toEqual({ job_id: "j1", from_id: "u1", to_id: "v1", amount: 20000 });
  });

  it("releaseEscrow and refundFromEscrow target their routes with job_id", async () => {
    setAuthToken("w-tok");
    mockResponse({ status: 200, body: {} });
    await releaseEscrow({ job_id: "j1" });
    expect(pathOf()).toBe("/api/v1/wallet/release");

    mockResponse({ status: 200, body: {} });
    await refundFromEscrow({ job_id: "j1" });
    expect(pathOf()).toBe("/api/v1/wallet/refund");
    expect(jsonBody()).toEqual({ job_id: "j1" });
  });

  it("withdraw POSTs to /wallet/withdraw", async () => {
    setAuthToken("w-tok");
    mockResponse({ status: 200, body: {} });

    await withdraw({ amount: 10000, bank_code: "058", account_number: "0123456789" });

    expect(lastRequest().method).toBe("POST");
    expect(pathOf()).toBe("/api/v1/wallet/withdraw");
  });
});
