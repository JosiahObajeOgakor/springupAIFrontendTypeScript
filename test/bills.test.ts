import { describe, it, expect } from "vitest";
import { getRemitaCatalog, getRemitaCategories, vendRemitaService } from "@/lib/api/bills";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("bills / Remita module", () => {
  it("getRemitaCatalog GETs the VAS catalog", async () => {
    setAuthToken("b-tok");
    mockResponse({ body: { provider: "remita", source: "embedded", remote_configured: false, services: [] } });

    const res = await getRemitaCatalog();

    expect(lastRequest().method).toBe("GET");
    expect(pathOf()).toBe("/api/v1/bills/remita/catalog");
    expect(res.provider).toBe("remita");
  });

  it("getRemitaCategories passes page + size query params (defaults 0/20)", async () => {
    setAuthToken("b-tok");
    mockResponse({ body: { message: "ok", status: "00", data: { totalPage: 1, totalContent: 0, items: [] } } });

    await getRemitaCategories();

    const path = pathOf();
    expect(path.startsWith("/api/v1/bills/remita/categories?")).toBe(true);
    expect(path).toContain("page=0");
    expect(path).toContain("size=20");
  });

  it("vendRemitaService POSTs the vend request", async () => {
    setAuthToken("b-tok");
    mockResponse({ body: { status: "success", provider: "remita", reference: "r1", message: "done", payload: {} } });

    const res = await vendRemitaService({
      biller_name: "Ikeja Electric",
      customer_reference: "ACC-123",
      amount: 500000,
    });

    expect(pathOf()).toBe("/api/v1/bills/remita/vend");
    expect(jsonBody()).toMatchObject({ biller_name: "Ikeja Electric", amount: 500000 });
    expect(res.status).toBe("success");
  });
});
