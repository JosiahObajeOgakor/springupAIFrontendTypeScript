import { describe, it, expect } from "vitest";
import { api, ApiError } from "@/lib/api/client";
import { store } from "@/lib/store";
import {
  setAuthToken,
  mockResponse,
  mockResponses,
  lastRequest,
  requestAt,
  pathOf,
  requests,
} from "./utils";

describe("api client (cross-cutting behaviour)", () => {
  it("targets the configured gateway base URL", async () => {
    mockResponse({ body: { ok: true } });
    await api("/api/v1/ping");
    expect(lastRequest().url).toBe("http://127.0.0.1:8080/api/v1/ping");
  });

  it("attaches a Bearer token when authenticated and omits it with noAuth", async () => {
    setAuthToken("secret-token");

    mockResponse({ body: {} });
    await api("/api/v1/secure");
    expect(lastRequest().headers["Authorization"]).toBe("Bearer secret-token");

    mockResponse({ body: {} });
    await api("/api/v1/public", { noAuth: true });
    expect(lastRequest().headers["Authorization"]).toBeUndefined();
  });

  it("serialises query params and drops undefined values", async () => {
    mockResponse({ body: {} });
    await api("/api/v1/list", { params: { page: 2, pageSize: undefined, q: "ac" } });
    const path = pathOf();
    expect(path.startsWith("/api/v1/list?")).toBe(true);
    expect(path).toContain("page=2");
    expect(path).toContain("q=ac");
    expect(path).not.toContain("pageSize");
  });

  it("sets JSON Content-Type for object bodies", async () => {
    mockResponse({ body: {} });
    await api("/api/v1/thing", { method: "POST", body: { a: 1 } });
    expect(lastRequest().headers["Content-Type"]).toBe("application/json");
  });

  it("throws ApiError carrying status and parsed body on non-2xx", async () => {
    mockResponses(
      { status: 500, body: { error: "boom" } },
      { status: 422, body: { error: "bad" } },
    );
    await expect(api("/api/v1/fail")).rejects.toMatchObject({
      status: 500,
      body: { error: "boom" },
    });
    await expect(api("/api/v1/fail2")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined for 204 No Content", async () => {
    mockResponse({ status: 204 });
    const res = await api("/api/v1/none", { method: "DELETE" });
    expect(res).toBeUndefined();
  });

  it("on 401 refreshes the token then retries the original request once", async () => {
    setAuthToken("stale-token", "refresh-1");

    mockResponses(
      { status: 401, body: { error: "expired" } }, // original attempt
      { status: 200, body: { token: "fresh-token", refresh_token: "refresh-2" } }, // refresh
      { status: 200, body: { data: "ok" } }, // retried original
    );

    const res = await api<{ data: string }>("/api/v1/protected");

    expect(res).toEqual({ data: "ok" });
    expect(requests).toHaveLength(3);
    expect(pathOf(requestAt(1))).toBe("/api/v1/auth/refresh");
    // Retry carries the refreshed token from the store.
    expect(requestAt(2).headers["Authorization"]).toBe("Bearer fresh-token");
    expect(store.getState().auth.token).toBe("fresh-token");
  });
});
