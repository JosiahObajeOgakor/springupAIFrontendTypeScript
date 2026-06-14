import { api } from "./client";
import type { User, UserProfileResponse, UserUpdatePayload } from "./types";

export async function getUserProfile() {
  return api<UserProfileResponse>("/api/v1/user/profile");
}

// PATCH /api/v1/user/update — returns the updated User per spec.
export async function updateUserProfile(payload: UserUpdatePayload) {
  return api<User>("/api/v1/user/update", {
    method: "PATCH",
    body: payload,
  });
}
