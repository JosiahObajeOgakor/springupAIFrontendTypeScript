import { describe, it, expect } from "vitest";
import { getUserProfile, updateUserProfile } from "@/lib/api/user";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("user module", () => {
  it("getUserProfile GETs /user/profile with the bearer token", async () => {
    setAuthToken("u-token");
    mockResponse({ body: { user: { id: "u1", phone: "0801", name: "Ada", language: "en", location: "Lagos" } } });

    const res = await getUserProfile();

    const req = lastRequest();
    expect(req.method).toBe("GET");
    expect(pathOf(req)).toBe("/api/v1/user/profile");
    expect(req.headers["Authorization"]).toBe("Bearer u-token");
    expect(res.user.name).toBe("Ada");
  });

  it("updateUserProfile PATCHes /user/update with the changed fields", async () => {
    setAuthToken("u-token");
    mockResponse({ status: 204 });

    await updateUserProfile({ name: "Ada B", location: "Abuja" });

    const req = lastRequest();
    expect(req.method).toBe("PATCH");
    expect(pathOf(req)).toBe("/api/v1/user/update");
    expect(jsonBody(req)).toEqual({ name: "Ada B", location: "Abuja" });
  });
});
