import { api } from "./client";
import type {
  AirtimePayload,
  RemitaCatalogResponse,
  RemitaCategoriesResponse,
  RemitaVendPayload,
  RemitaVendResponse,
  FlightSearchParams,
  FlightBookPayload,
} from "./types";

export async function buyAirtime(payload: AirtimePayload) {
  return api<void>("/api/v1/bills/airtime", {
    method: "POST",
    body: payload,
  });
}

export async function getRemitaCatalog() {
  return api<RemitaCatalogResponse>("/api/v1/bills/remita/catalog");
}

export async function getRemitaCategories(page = 0, size = 20) {
  return api<RemitaCategoriesResponse>("/api/v1/bills/remita/categories", {
    params: { page, size },
  });
}

export async function vendRemitaService(payload: RemitaVendPayload) {
  return api<RemitaVendResponse>("/api/v1/bills/remita/vend", {
    method: "POST",
    body: payload,
  });
}

// GET /api/v1/bills/flights/search
export async function searchFlights(params: FlightSearchParams) {
  return api<unknown>("/api/v1/bills/flights/search", {
    params: params as unknown as Record<string, string | number | undefined>,
  });
}

// POST /api/v1/bills/flights/book
export async function bookFlight(payload: FlightBookPayload) {
  return api<unknown>("/api/v1/bills/flights/book", {
    method: "POST",
    body: payload,
  });
}
