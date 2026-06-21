import { describe, it, expect } from "vitest";
import { getKycPresignUrl, submitKyc, getKycStatus, getKycDocument } from "@/lib/api/kyc";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("kyc module", () => {
  it("getKycPresignUrl POSTs vendor_id + type in the body and returns a PUT url", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { put_url: "https://s3/put", key: "kyc/vend-1/national_id" } });

    const res = await getKycPresignUrl({ vendor_id: "vend-1", type: "national_id" });

    // Spec: the gateway reads vendor_id + type from the JSON body (query ignored).
    const req = lastRequest();
    expect(req.method).toBe("POST");
    expect(pathOf(req)).toBe("/api/v1/vendor/kyc/presign");
    expect(jsonBody(req)).toEqual({ vendor_id: "vend-1", type: "national_id" });
    expect(res.put_url).toContain("s3");
  });

  it("submitKyc POSTs the NIN/method payload and returns payment_pending", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { vendor_id: "vend-1", method: "nin", status: "payment_pending", paystack_ref: "ref" } });

    const res = await submitKyc({ vendor_id: "vend-1", method: "nin", nin: "12345678901" });

    expect(pathOf()).toBe("/api/v1/vendor/kyc/submit");
    expect(jsonBody()).toMatchObject({ vendor_id: "vend-1", method: "nin", nin: "12345678901" });
    expect(res.status).toBe("payment_pending");
  });

  it("getKycStatus GETs status with an encoded vendorId query", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { vendor_id: "vend 1", status: "verified" } });

    const res = await getKycStatus("vend 1");

    const req = lastRequest();
    expect(req.method).toBe("GET");
    expect(pathOf(req)).toBe("/api/v1/vendor/kyc/status?vendorId=vend+1");
    expect(res.status).toBe("verified");
  });

  it("getKycDocument GETs a presigned document URL", async () => {
    setAuthToken("k-tok");
    mockResponse({ body: { get_url: "https://s3/get", key: "kyc/vend-1/national_id" } });

    const res = await getKycDocument("vend-1", "national_id");

    const req = lastRequest();
    expect(req.method).toBe("GET");
    expect(pathOf(req)).toBe("/api/v1/vendor/kyc/document?vendor_id=vend-1&type=national_id");
    expect(res.get_url).toContain("s3");
  });
});
