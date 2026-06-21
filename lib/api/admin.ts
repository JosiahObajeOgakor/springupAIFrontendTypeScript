import { api } from "./client";
import type {
  User,
  Vendor,
  PaginatedResponse,
  KycOverridePayload,
  RadioBatchUploadPayload,
  RadioSingleUploadPayload,
  EbookAdvanceReviewPayload,
  EmbedKeyCreatePayload,
  EmbedKeyCreateResponse,
  EmbedKeyRevokePayload,
  AdminDashboardResponse,
  AdminDisputeResolvePayload,
  AdminVendorSuspendPayload,
  AdminVendorUnsuspendPayload,
  AdminVendorApprovePayload,
  AdminMlRuleCreatePayload,
  AdminMlRuleUpdatePayload,
  AdminEventLogParams,
} from "./types";
import { listRadioTracks, uploadRadioBatch, uploadRadioTrack } from "./radio";

export async function listUsers(page?: number, pageSize?: number) {
  return api<PaginatedResponse<User>>("/api/v1/admin/users", {
    params: { page, pageSize },
  });
}

export async function listVendors(page?: number, pageSize?: number) {
  return api<PaginatedResponse<Vendor>>("/api/v1/admin/vendors", {
    params: { page, pageSize },
  });
}

export async function overrideKyc(payload: KycOverridePayload) {
  return api<void>("/api/v1/admin/vendor/kyc-override", {
    method: "POST",
    body: payload,
  });
}

export async function listAdminRadioTracks() {
  return listRadioTracks();
}

export async function uploadAdminRadioTrack(
  payload: RadioSingleUploadPayload,
  onProgress?: (percent: number) => void,
) {
  return uploadRadioTrack(payload, onProgress);
}

export async function uploadAdminRadioBatch(
  payload: RadioBatchUploadPayload,
  onProgress?: (percent: number) => void,
) {
  return uploadRadioBatch(payload, onProgress);
}

export async function reviewEbookAdvance(payload: EbookAdvanceReviewPayload) {
  return api<void>("/api/v1/ebook/advance/review", {
    method: "POST",
    body: payload,
  });
}

export async function createEmbedKey(payload: EmbedKeyCreatePayload) {
  return api<EmbedKeyCreateResponse>("/api/v1/admin/embed-key/create", {
    method: "POST",
    body: payload,
  });
}

export async function revokeEmbedKey(payload: EmbedKeyRevokePayload) {
  return api<void>("/api/v1/admin/embed-key/revoke", {
    method: "POST",
    body: payload,
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getAdminDashboard() {
  return api<AdminDashboardResponse>("/api/v1/admin/dashboard");
}

// ─── User management ──────────────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  return api<void>("/api/v1/admin/user", {
    method: "DELETE",
    params: { user_id: userId },
  });
}

// ─── Dispute resolution ───────────────────────────────────────────────────────
export async function resolveDispute(payload: AdminDisputeResolvePayload) {
  return api<void>("/api/v1/admin/dispute/resolve", {
    method: "POST",
    body: payload,
  });
}

// ─── Vendor management ────────────────────────────────────────────────────────
export async function suspendVendor(payload: AdminVendorSuspendPayload) {
  return api<void>("/api/v1/admin/vendor/suspend", {
    method: "POST",
    body: payload,
  });
}

export async function unsuspendVendor(payload: AdminVendorUnsuspendPayload) {
  return api<void>("/api/v1/admin/vendor/unsuspend", {
    method: "POST",
    body: payload,
  });
}

export async function approveVendor(payload: AdminVendorApprovePayload) {
  return api<void>("/api/v1/admin/vendor/approve", {
    method: "POST",
    body: payload,
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export async function getRevenueReport()         { return api<unknown>("/api/v1/admin/reports/revenue"); }
export async function getPurchaseReport()        { return api<unknown>("/api/v1/admin/reports/purchases"); }
export async function getEscrowReport()          { return api<unknown>("/api/v1/admin/reports/escrow"); }
export async function getSettlementsReport()     { return api<unknown>("/api/v1/admin/reports/settlements"); }
export async function getCommissionsReport()     { return api<unknown>("/api/v1/admin/reports/commissions"); }
export async function getEngagementReport()      { return api<unknown>("/api/v1/admin/reports/engagement"); }
export async function getOnlineReport()          { return api<unknown>("/api/v1/admin/reports/online"); }
export async function getSuspensionsReport()     { return api<unknown>("/api/v1/admin/reports/suspensions"); }
export async function getKycReport()             { return api<unknown>("/api/v1/admin/reports/kyc"); }
export async function getPendingPaymentsReport() { return api<unknown>("/api/v1/admin/reports/pending-payments"); }
export async function getResolutionsReport()     { return api<unknown>("/api/v1/admin/reports/resolutions"); }

// ─── ML ───────────────────────────────────────────────────────────────────────
export async function getMlMetrics() {
  return api<unknown>("/api/v1/admin/ml/metrics");
}

export async function createMlRule(payload: AdminMlRuleCreatePayload) {
  return api<unknown>("/api/v1/admin/ml/rules", {
    method: "POST",
    body: payload,
  });
}

export async function updateMlRule(payload: AdminMlRuleUpdatePayload) {
  return api<unknown>("/api/v1/admin/ml/rules", {
    method: "PATCH",
    body: payload,
  });
}

// ─── Event logs ───────────────────────────────────────────────────────────────
export async function getEventLogs(params?: AdminEventLogParams) {
  return api<unknown>("/api/v1/admin/logs/events", {
    params: params as Record<string, string | undefined> | undefined,
  });
}
