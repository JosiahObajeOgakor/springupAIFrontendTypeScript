import { api, setToken, clearToken } from "./client";
import type { AuthResponse, RefreshResponse, AdminLoginPayload, AdminLoginResponse } from "./types";

export async function registerUser(payload: {
  phone: string;
  name: string;
  language?: string;
  location?: string;
}) {
  const res = await api<AuthResponse>(
    "/api/v1/user/register",
    { method: "POST", body: payload, noAuth: true }
  );
  setToken(res.token);
  if (res.refresh_token) {
    localStorage.setItem("refresh_token", res.refresh_token);
  }
  return res;
}

export async function login(phone: string) {
  const res = await api<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { phone },
    noAuth: true,
  });
  setToken(res.token);
  if (res.refresh_token) {
    localStorage.setItem("refresh_token", res.refresh_token);
  }
  return res;
}

export async function adminLogin(payload: AdminLoginPayload) {
  const res = await api<AdminLoginResponse>("/api/v1/admin/login", {
    method: "POST",
    body: payload,
    noAuth: true,
  });
  setToken(res.token);
  return res;
}

export async function refreshToken() {
  const rt = localStorage.getItem("refresh_token");
  if (!rt) throw new Error("No refresh token available");
  const res = await api<RefreshResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: { refresh_token: rt },
    noAuth: true,
  });
  setToken(res.token);
  if (res.refresh_token) {
    localStorage.setItem("refresh_token", res.refresh_token);
  }
  return res;
}

export async function revokeToken() {
  const token = localStorage.getItem("token");
  if (token) {
    await api<void>("/api/v1/auth/revoke", {
      method: "POST",
      body: { token },
    });
  }
  clearToken();
  localStorage.removeItem("refresh_token");
}

export function logout() {
  clearToken();
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("vendor");
  localStorage.removeItem("vendor_id");
}
