import { api } from "./client";
import type {
  MarketplaceSearchPayload,
  MarketplaceSearchResponse,
  JobAcceptPayload,
  JobCompletePayload,
} from "./types";

export async function searchMarketplace(payload: MarketplaceSearchPayload) {
  return api<MarketplaceSearchResponse>("/api/v1/marketplace/search", {
    method: "POST",
    body: payload,
  });
}

export async function acceptJob(payload: JobAcceptPayload) {
  return api<void>("/api/v1/marketplace/job/accept", {
    method: "POST",
    body: payload,
  });
}

export async function completeJob(payload: JobCompletePayload) {
  return api<void>("/api/v1/marketplace/job/complete", {
    method: "POST",
    body: payload,
  });
}
