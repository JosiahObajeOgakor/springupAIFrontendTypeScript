import { store } from '@/lib/store';
import { updateToken, clearAuth } from '@/lib/store/authSlice';
import { useUiStore } from '@/lib/stores/ui-store';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.springupai.com";

// ─── Global loading tracker ─────────────────────────────────────────────────
// Minor UI state lives in the Zustand ui-store; GlobalSpinner subscribes to it.
function trackStart() {
  useUiStore.getState().startLoading();
}

function trackEnd() {
  useUiStore.getState().endLoading();
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ResponseType = "json" | "blob" | "text" | "response";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  responseType?: ResponseType;
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
  return store.getState().auth.token;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return store.getState().auth.refreshToken;
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
  if (typeof window === "undefined") return false;
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) {
      store.dispatch(
        updateToken({
          token: data.token,
          refreshToken: data.refresh_token,
        })
      );
    }
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
        store.dispatch(clearAuth());
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path.startsWith("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/";
          }
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

  trackStart();
  try {
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

  if (res.status === 401 && !noAuth) {
    await queueRefresh();
    res = await makeRequest();
  }

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
  } finally {
    trackEnd();
  }
}

export function uploadWithProgress<T = unknown>(
  path: string,
  body: FormData | Blob | File,
  options: {
    method?: string;
    headers?: Record<string, string>;
    onProgress?: (percent: number) => void;
    noAuth?: boolean;
  } = {},
): Promise<T> {
  const { method = "POST", headers = {}, onProgress, noAuth } = options;
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  trackStart();
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (!noAuth) {
      const token = getToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      trackEnd();
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as T);
        } catch {
          resolve(undefined as T);
        }
      } else {
        reject(new ApiError(xhr.status, xhr.responseText));
      }
    });

    xhr.addEventListener("error", () => { trackEnd(); reject(new Error("Upload network error")); });
    xhr.addEventListener("abort", () => { trackEnd(); reject(new Error("Upload aborted")); });

    xhr.send(body);
  });
}
