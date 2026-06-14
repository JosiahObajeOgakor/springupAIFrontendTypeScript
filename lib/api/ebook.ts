import { api, uploadWithProgress } from "./client";
import type {
  Ebook,
  EbookPurchasePayload,
  EbookUploadPayload,
  HardCopyPurchasePayload,
  HardCopyStatusResponse,
  EbookAdvanceRequestPayload,
  HardCopyConfirmPayload,
} from "./types";

export async function uploadEbook(
  payload: EbookUploadPayload,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("title", payload.title);
  form.append("author", payload.author);
  form.append("price", String(payload.price));

  if (onProgress) {
    await uploadWithProgress<void>("/api/v1/ebook/upload", form, { onProgress });
    return;
  }

  return api<void>("/api/v1/ebook/upload", { method: "POST", body: form });
}

export async function listEbooks(): Promise<Ebook[]> {
  const res = await api<Ebook[] | { items?: Ebook[]; data?: Ebook[] }>("/api/v1/ebook/list");
  if (Array.isArray(res)) return res;
  return (res as any).items ?? (res as any).data ?? [];
}

export async function purchaseEbook(payload: EbookPurchasePayload): Promise<void> {
  return api<void>("/api/v1/ebook/purchase", { method: "POST", body: payload });
}

export async function purchaseHardCopy(payload: HardCopyPurchasePayload): Promise<void> {
  return api<void>("/api/v1/ebook/hard-copy/purchase", { method: "POST", body: payload });
}

export async function getHardCopyStatus(orderId: string): Promise<HardCopyStatusResponse> {
  return api<HardCopyStatusResponse>(`/api/v1/ebook/hard-copy/status/${orderId}`);
}

export async function confirmHardCopyDelivery(payload: HardCopyConfirmPayload): Promise<void> {
  return api<void>("/api/v1/ebook/hard-copy/confirm", { method: "POST", body: payload });
}

export async function requestEbookAdvance(payload: EbookAdvanceRequestPayload): Promise<void> {
  return api<void>("/api/v1/ebook/advance/request", { method: "POST", body: payload });
}
