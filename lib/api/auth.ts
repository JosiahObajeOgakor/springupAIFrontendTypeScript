import { api } from "./client";
import { store } from "@/lib/store";
import { setCredentials, updateToken, clearAuth } from "@/lib/store/authSlice";
import { normalizePhone } from "@/lib/phone";
import type { AuthResponse, RefreshResponse, AdminLoginPayload, AdminLoginResponse, TokenResponse } from "./types";

export async function registerUser(payload: {
  phone: string;
  name: string;
  language?: string;
  location?: string;
}) {
  const res = await api<AuthResponse>(
    "/api/v1/user/register",
    { method: "POST", body: { ...payload, phone: normalizePhone(payload.phone) }, noAuth: true }
  );
  store.dispatch(setCredentials({
    token: res.token,
    refreshToken: res.refresh_token,
    vendorId: res.user.id,
  }));
  return res;
}

export async function login(phone: string) {
  const res = await api<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { phone: normalizePhone(phone) },
    noAuth: true,
  });
  store.dispatch(setCredentials({
    token: res.token,
    refreshToken: res.refresh_token,
    vendorId: res.user.id,
  }));
  return res;
}

export async function adminLogin(payload: AdminLoginPayload) {
  // Gateway expects only the admin key under "secret" (or the X-Admin-Key
  // header). Send a minimal body so we never leak stray fields.
  const res = await api<AdminLoginResponse>("/api/v1/admin/login", {
    method: "POST",
    body: { secret: payload.secret },
    noAuth: true,
  });
  // Defensively accept both `token` and `access_token` in case the server
  // response shape differs from the spec.
  const jwt =
    res.token ??
    (res as unknown as Record<string, string>).access_token ??
    (res as unknown as Record<string, string>).data;
  if (!jwt || typeof jwt !== 'string') {
    throw new Error('Admin login did not return a token.');
  }
  store.dispatch(setCredentials({
    token: jwt,
    vendorId: "admin",
  }));
  return { ...res, token: jwt };
}

// POST /api/v1/auth/vendor-token — mint a vendor-role token for the current
// authenticated user and promote the session to the vendor role.
export async function mintVendorToken() {
  const res = await api<TokenResponse>("/api/v1/auth/vendor-token", {
    method: "POST",
  });
  store.dispatch(setCredentials({
    token: res.token,
    refreshToken: res.refresh_token,
    vendorId: store.getState().auth.vendorId ?? "",
  }));
  return res;
}

export async function refreshToken() {
  const rt = store.getState().auth.refreshToken;
  if (!rt) throw new Error("No refresh token available");
  const res = await api<RefreshResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: { refresh_token: rt },
    noAuth: true,
  });
  store.dispatch(updateToken({
    token: res.token,
    refreshToken: res.refresh_token,
  }));
  return res;
}

export async function revokeToken() {
  const token = store.getState().auth.token;
  if (token) {
    await api<void>("/api/v1/auth/revoke", {
      method: "POST",
      body: { token },
    });
  }
  store.dispatch(clearAuth());
}

export function logout() {
  store.dispatch(clearAuth());
}
