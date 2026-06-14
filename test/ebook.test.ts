import { describe, it, expect } from "vitest";
import {
  uploadEbook,
  listEbooks,
  purchaseEbook,
  purchaseHardCopy,
  getHardCopyStatus,
  confirmHardCopyDelivery,
  requestEbookAdvance,
} from "@/lib/api/ebook";
import { setAuthToken, mockResponse, lastRequest, jsonBody, formBody, pathOf } from "./utils";

describe("ebook module", () => {
  it("uploadEbook (no progress) POSTs multipart with title/author/price", async () => {
    setAuthToken("e-tok");
    mockResponse({ status: 201, body: {} });

    const file = new File(["%PDF-1.4"], "book.pdf", { type: "application/pdf" });
    await uploadEbook({ file, title: "Hustle", author: "Ada", price: 250000 });

    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/ebook/upload");
    const form = formBody(req);
    expect(form.get("title")).toBe("Hustle");
    expect(form.get("price")).toBe("250000");
  });

  it("listEbooks unwraps an { items: [...] } envelope", async () => {
    setAuthToken("e-tok");
    mockResponse({ body: { items: [{ id: "b1", title: "Hustle", author: "Ada", price: 250000 }] } });

    const books = await listEbooks();
    expect(pathOf()).toBe("/api/v1/ebook/list");
    expect(books[0].id).toBe("b1");
  });

  it("purchaseEbook POSTs the ebook id", async () => {
    setAuthToken("e-tok");
    mockResponse({ status: 200, body: {} });

    await purchaseEbook({ ebook_id: "b1" });

    expect(pathOf()).toBe("/api/v1/ebook/purchase");
    expect(jsonBody()).toEqual({ ebook_id: "b1" });
  });

  it("purchaseHardCopy POSTs delivery details for escrow-backed order", async () => {
    setAuthToken("e-tok");
    mockResponse({ status: 200, body: {} });

    await purchaseHardCopy({ ebook_id: "b1", delivery_address: "1 Main St", delivery_phone: "0801" });

    expect(pathOf()).toBe("/api/v1/ebook/hard-copy/purchase");
    expect(jsonBody()).toMatchObject({ ebook_id: "b1", delivery_address: "1 Main St" });
  });

  it("getHardCopyStatus GETs the order status by id", async () => {
    setAuthToken("e-tok");
    mockResponse({ body: { status: "shipped", tracking_number: "TRK-1" } });

    const res = await getHardCopyStatus("ord-1");

    expect(lastRequest().method).toBe("GET");
    expect(pathOf()).toBe("/api/v1/ebook/hard-copy/status/ord-1");
    expect(res.status).toBe("shipped");
  });

  it("confirmHardCopyDelivery and requestEbookAdvance hit their routes", async () => {
    setAuthToken("e-tok");
    mockResponse({ status: 200, body: {} });
    await confirmHardCopyDelivery({ order_id: "ord-1" });
    expect(pathOf()).toBe("/api/v1/ebook/hard-copy/confirm");

    mockResponse({ status: 200, body: {} });
    await requestEbookAdvance({ order_id: "ord-1", amount: 40000, reason: "cash flow" });
    expect(pathOf()).toBe("/api/v1/ebook/advance/request");
    expect(jsonBody()).toMatchObject({ order_id: "ord-1", amount: 40000 });
  });
});
