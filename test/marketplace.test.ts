import { describe, it, expect } from "vitest";
import { searchMarketplace, acceptJob, completeJob } from "@/lib/api/marketplace";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("marketplace module", () => {
  it("searchMarketplace POSTs the filters and returns vendors", async () => {
    setAuthToken("m-tok");
    mockResponse({ body: { vendors: [{ vendor_id: "v1", name: "Cool AC", verified: true, location: "Ikeja" }] } });

    const res = await searchMarketplace({ category: "Air Conditioning", location: "Ikeja" });

    const req = lastRequest();
    expect(req.method).toBe("POST");
    expect(pathOf(req)).toBe("/api/v1/marketplace/search");
    expect(jsonBody(req)).toMatchObject({ category: "Air Conditioning", location: "Ikeja" });
    expect(res.vendors[0].vendor_id).toBe("v1");
  });

  it("acceptJob POSTs job_id + vendor_id", async () => {
    setAuthToken("m-tok");
    mockResponse({ status: 200, body: {} });

    await acceptJob({ job_id: "j1", vendor_id: "v1" });

    expect(pathOf()).toBe("/api/v1/marketplace/job/accept");
    expect(jsonBody()).toEqual({ job_id: "j1", vendor_id: "v1" });
  });

  it("completeJob POSTs job_id", async () => {
    setAuthToken("m-tok");
    mockResponse({ status: 200, body: {} });

    await completeJob({ job_id: "j1" });

    expect(pathOf()).toBe("/api/v1/marketplace/job/complete");
    expect(jsonBody()).toEqual({ job_id: "j1" });
  });
});
