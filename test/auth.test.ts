import { describe, it, expect } from "vitest";
import { registerUser, login, adminLogin, refreshToken, revokeToken } from "@/lib/api/auth";
import { store } from "@/lib/store";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("auth module (Gateway /api/v1/{user,auth,admin})", () => {
  it("registerUser POSTs to /user/register without auth and persists the token", async () => {
    mockResponse({
      status: 201,
      body: { token: "tok-1", user: { id: "u1", phone: "08010000000", name: "Ada" } },
    });

    const res = await registerUser({ phone: "08010000000", name: "Ada" });

    const req = lastRequest();
    expect(req.method).toBe("POST");
    expect(pathOf(req)).toBe("/api/v1/user/register");
    expect(req.headers["Authorization"]).toBeUndefined();
    expect(jsonBody(req)).toEqual({ phone: "08010000000", name: "Ada" });
    expect(res.token).toBe("tok-1");
    expect(store.getState().auth.token).toBe("tok-1");
    expect(store.getState().auth.vendorId).toBe("u1");
  });

  it("login POSTs phone to /auth/login and stores token + refresh token", async () => {
    mockResponse({
      body: {
        token: "tok-2",
        refresh_token: "ref-2",
        user: { id: "u2", phone: "08020000000", name: "Bola" },
      },
    });

    await login("08020000000");

    expect(pathOf()).toBe("/api/v1/auth/login");
    expect(jsonBody()).toEqual({ phone: "08020000000" });
    expect(store.getState().auth.token).toBe("tok-2");
    expect(store.getState().auth.refreshToken).toBe("ref-2");
  });

  it("adminLogin sends only the secret (no phone) per spec", async () => {
    mockResponse({ body: { token: "admin-tok" } });

    await adminLogin({ secret: "dev-admin-key" });

    expect(pathOf()).toBe("/api/v1/admin/login");
    expect(jsonBody()).toEqual({ secret: "dev-admin-key" });
    expect(store.getState().auth.token).toBe("admin-tok");
    expect(store.getState().auth.vendorId).toBe("admin");
  });

  it("refreshToken exchanges the stored refresh token for a new access token", async () => {
    setAuthToken("old", "ref-token");
    mockResponse({ body: { token: "new-tok", refresh_token: "new-ref" } });

    await refreshToken();

    expect(pathOf()).toBe("/api/v1/auth/refresh");
    expect(jsonBody()).toEqual({ refresh_token: "ref-token" });
    expect(store.getState().auth.token).toBe("new-tok");
    expect(store.getState().auth.refreshToken).toBe("new-ref");
  });

  it("refreshToken throws when no refresh token is present", async () => {
    setAuthToken("only-access");
    await expect(refreshToken()).rejects.toThrow(/no refresh token/i);
  });

  it("revokeToken posts the token then clears auth", async () => {
    setAuthToken("live-token", "ref");
    mockResponse({ status: 204 });

    await revokeToken();

    expect(pathOf()).toBe("/api/v1/auth/revoke");
    expect(jsonBody()).toEqual({ token: "live-token" });
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.token).toBeNull();
  });
});
