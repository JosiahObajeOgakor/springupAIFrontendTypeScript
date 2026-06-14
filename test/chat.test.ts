import { describe, it, expect } from "vitest";
import { initiateChat } from "@/lib/api/chat";
import { setAuthToken, mockResponse, mockResponses, requests, requestAt, pathOf } from "./utils";

// The gateway has no synchronous chat API, so the web entry point ensures the
// phone maps to a user (mirroring the WhatsApp auto-register) and then hands off
// to WhatsApp.
describe("web chat module (WhatsApp handoff)", () => {
  it("for an authenticated caller, makes no auth calls and returns a WhatsApp link", async () => {
    setAuthToken("session-tok");

    const res = await initiateChat({ phone: "08010000000", audience: "vendor", source: "vendor" });

    expect(requests).toHaveLength(0);
    expect(res.registered).toBe(false);
    expect(res.whatsappUrl).toContain("https://wa.me/2348000000000");
  });

  it("for a known guest, logs in by phone then returns the handoff", async () => {
    setAuthToken(null);
    mockResponse({ body: { token: "guest-tok", refresh_token: "r1", user: { id: "u1", phone: "0801", name: "0801" } } });

    const res = await initiateChat({ phone: "08010000000", audience: "guest", source: "guest" });

    expect(requests).toHaveLength(1);
    expect(pathOf(requestAt(0))).toBe("/api/v1/auth/login");
    expect(res.registered).toBe(false);
    expect(res.whatsappUrl).toContain("wa.me");
  });

  it("auto-registers when the phone is unknown (login 404)", async () => {
    setAuthToken(null);
    mockResponses(
      { status: 404, body: { error: "user not found" } }, // login
      { status: 201, body: { token: "new-tok", user: { id: "u2", phone: "0802", name: "0802" } } }, // register
    );

    const res = await initiateChat({ phone: "0802", audience: "guest" });

    expect(requests).toHaveLength(2);
    expect(pathOf(requestAt(0))).toBe("/api/v1/auth/login");
    expect(pathOf(requestAt(1))).toBe("/api/v1/user/register");
    expect(res.registered).toBe(true);
  });

  it("propagates non-404 login errors", async () => {
    setAuthToken(null);
    mockResponse({ status: 500, body: { error: "boom" } });

    await expect(initiateChat({ phone: "0801", audience: "guest" })).rejects.toBeTruthy();
  });
});
