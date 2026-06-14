import { vi } from "vitest";
import { store } from "@/lib/store";
import { setCredentials, clearAuth } from "@/lib/store/authSlice";

export const API_BASE = "http://127.0.0.1:8080";

/** A queued fake response the mocked fetch will return, FIFO. */
export interface MockResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

/** A captured outbound request, for assertions. */
export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  rawBody: BodyInit | null | undefined;
}

let responseQueue: MockResponse[] = [];
export const requests: CapturedRequest[] = [];

/** Queue one response. Calls consume responses in order. */
export function mockResponse(res: MockResponse = {}) {
  responseQueue.push(res);
}

/** Queue several responses at once. */
export function mockResponses(...res: MockResponse[]) {
  responseQueue.push(...res);
}

export function resetFetch() {
  responseQueue = [];
  requests.length = 0;
}

function headersToObject(init: RequestInit): Record<string, string> {
  const out: Record<string, string> = {};
  const h = init.headers;
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((v, k) => (out[k] = v));
  } else if (Array.isArray(h)) {
    for (const [k, v] of h) out[k] = v;
  } else {
    Object.assign(out, h);
  }
  return out;
}

export function installFetchMock() {
  global.fetch = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    requests.push({
      url: String(input),
      method: (init.method ?? "GET").toUpperCase(),
      headers: headersToObject(init),
      rawBody: init.body,
    });

    const next = responseQueue.shift() ?? { status: 200, body: {} };
    const status = next.status ?? 200;
    const headers = new Headers(next.headers ?? {});

    return {
      ok: status >= 200 && status < 300,
      status,
      headers,
      json: async () => next.body,
      text: async () =>
        typeof next.body === "string" ? next.body : JSON.stringify(next.body ?? null),
      blob: async () => new Blob([JSON.stringify(next.body ?? null)]),
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

/** Seed (or clear) the auth token used for the Authorization header. */
export function setAuthToken(token: string | null, refreshToken?: string) {
  if (token) {
    store.dispatch(setCredentials({ token, refreshToken, vendorId: "vendor-test" }));
  } else {
    store.dispatch(clearAuth());
  }
}

export function lastRequest(): CapturedRequest {
  const r = requests[requests.length - 1];
  if (!r) throw new Error("No request was captured");
  return r;
}

export function requestAt(index: number): CapturedRequest {
  const r = requests[index];
  if (!r) throw new Error(`No request captured at index ${index}`);
  return r;
}

/** Parse a captured JSON request body. */
export function jsonBody(req: CapturedRequest = lastRequest()): Record<string, unknown> {
  if (typeof req.rawBody !== "string") {
    throw new Error("Request body is not a JSON string");
  }
  return JSON.parse(req.rawBody) as Record<string, unknown>;
}

/** The captured body as a FormData instance (for multipart uploads). */
export function formBody(req: CapturedRequest = lastRequest()): FormData {
  if (!(req.rawBody instanceof FormData)) {
    throw new Error("Request body is not FormData");
  }
  return req.rawBody;
}

/** Path + query, with the gateway origin stripped, for terse assertions. */
export function pathOf(req: CapturedRequest = lastRequest()): string {
  return req.url.startsWith(API_BASE) ? req.url.slice(API_BASE.length) : req.url;
}
