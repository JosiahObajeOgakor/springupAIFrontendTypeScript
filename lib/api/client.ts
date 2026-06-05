const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.springupai.com";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ResponseType = "json" | "blob" | "text" | "response";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  responseType?: ResponseType;
  /** Skip attaching the Authorization header */
  noAuth?: boolean;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  return buildUrl(path, params);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function attemptRefresh(): Promise<boolean> {
  const rt = localStorage.getItem("refresh_token");
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) setToken(data.token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function queueRefresh(): Promise<void> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = attemptRefresh().then((ok) => {
      isRefreshing = false;
      refreshPromise = null;
      if (!ok) {
        clearToken();
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/vendor/login";
        }
      }
    });
  }
  return refreshPromise!;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function api<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    headers = {},
    noAuth,
    responseType = "json",
  } = options;

  const url = buildUrl(path, params);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const makeRequest = async () => {
    const token = getToken();
    const reqHeaders: Record<string, string> = { ...headers };

    if (!isFormData && body !== undefined && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }

    if (!noAuth && token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
      method,
      headers: reqHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });
  };

  let res = await makeRequest();

  // Handle 401 — attempt token refresh and retry once
  if (res.status === 401 && !noAuth) {
    await queueRefresh();
    res = await makeRequest();
  }

  // Handle 429 — wait and retry once
  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
    await delay(waitMs);
    res = await makeRequest();
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;

  if (responseType === "response") {
    return res as T;
  }

  if (responseType === "blob") {
    return (await res.blob()) as T;
  }

  if (responseType === "text") {
    return (await res.text()) as T;
  }

  return res.json() as Promise<T>;
}
