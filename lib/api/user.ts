import { api } from "./client";
import type { UserProfileResponse, UserUpdatePayload } from "./types";

export async function getUserProfile() {
  return api<UserProfileResponse>("/api/v1/user/profile");
}

export async function updateUserProfile(payload: UserUpdatePayload) {
  return api<void>("/api/v1/user/update", {
    method: "PATCH",
    body: payload,
  });
}
