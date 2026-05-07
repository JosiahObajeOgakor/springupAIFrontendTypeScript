const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://i3b9muhewd.us-east-2.awsapprunner.com";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  /** Skip attaching the Authorization header */
  noAuth?: boolean;
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
  const { method = "GET", body, params, headers = {}, noAuth } = options;

  let url = `${BASE_URL}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const makeRequest = async () => {
    const token = getToken();
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (!noAuth && token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
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

  return res.json() as Promise<T>;
}
