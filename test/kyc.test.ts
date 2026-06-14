import { describe, it, expect } from "vitest";
import { getKycPresignUrl, submitKyc, getKycStatus } from "@/lib/api/kyc";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("kyc module", () => {
  it("getKycPresignUrl POSTs document metadata and returns a PUT url", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { put_url: "https://s3/put", key: "kyc/vend-1/nin.jpg" } });

    const res = await getKycPresignUrl({
      vendor_id: "vend-1",
      type: "nin",
      filename: "nin.jpg",
      content_type: "image/jpeg",
    });

    // vendor_id + type go on the query string (the KYC service reads them
    // there); the body still carries the full payload.
    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/vendor/kyc/presign?vendor_id=vend-1&type=nin");
    expect(jsonBody(req)).toMatchObject({ vendor_id: "vend-1", type: "nin", filename: "nin.jpg" });
    expect(res.put_url).toContain("s3");
  });

  it("submitKyc POSTs the verification payload and returns a Paystack url", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { authorization_url: "https://paystack/kyc", reference: "kyc-ref" } });

    const res = await submitKyc({
      vendor_id: "vend-1",
      document_key: "kyc/vend-1/nin.jpg",
      document_type: "nin",
      full_name: "Ada Eze",
      bvn: "12345678901",
    });

    expect(pathOf()).toBe("/api/v1/vendor/kyc/submit");
    expect(res.authorization_url).toContain("paystack");
  });

  it("getKycStatus GETs status with an encoded vendorId query", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { status: "verified" } });

    const res = await getKycStatus("vend 1");

    const req = lastRequest();
    expect(req.method).toBe("GET");
    expect(pathOf(req)).toBe("/api/v1/vendor/kyc/status?vendorId=vend%201");
    expect(res.status).toBe("verified");
  });
});
