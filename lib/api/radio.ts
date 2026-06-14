import { api, buildApiUrl, uploadWithProgress } from "./client";
import type {
  RadioBatchUploadPayload,
  RadioCheckPayload,
  RadioCheckResponse,
  RadioPreloadManifest,
  RadioSingleUploadPayload,
  RadioTrack,
  RadioTrackCollectionResponse,
  RadioUploadResponse,
} from "./types";

function extractTracks(payload: RadioTrack[] | RadioTrackCollectionResponse) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.tracks ?? payload.items ?? payload.data ?? [];
}

export async function uploadRadioTrack(
  payload: RadioSingleUploadPayload,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData();
  formData.append("file", payload.file);

  if (payload.title) formData.append("title", payload.title);
  if (payload.artist) formData.append("artist", payload.artist);
  if (payload.album) formData.append("album", payload.album);
  if (payload.genre) formData.append("genre", payload.genre);

  if (onProgress) {
    return uploadWithProgress<RadioUploadResponse>("/api/v1/radio/upload", formData, { onProgress });
  }

  return api<RadioUploadResponse>("/api/v1/radio/upload", {
    method: "POST",
    body: formData,
  });
}

export async function uploadRadioBatch(
  payload: RadioBatchUploadPayload,
  onProgress?: (percent: number) => void,
) {
  if (payload.files.length === 0) {
    throw new Error("Select at least one file to upload");
  }

  if (payload.files.length > 10) {
    throw new Error("Batch upload supports up to 10 files");
  }

  const formData = new FormData();
  for (const file of payload.files) {
    formData.append("files", file);
  }

  if (onProgress) {
    return uploadWithProgress<RadioUploadResponse>("/api/v1/radio/upload/batch", formData, { onProgress });
  }

  return api<RadioUploadResponse>("/api/v1/radio/upload/batch", {
    method: "POST",
    body: formData,
  });
}

export async function listRadioTracks() {
  const response = await api<RadioTrack[] | RadioTrackCollectionResponse>(
    "/api/v1/radio/tracks"
  );

  return extractTracks(response);
}

export async function preloadRadioTracks(): Promise<RadioPreloadManifest> {
  return api<RadioPreloadManifest>("/api/v1/radio/preload");
}

export async function checkRadioBuffer(payload: RadioCheckPayload = {}): Promise<RadioCheckResponse> {
  return api<RadioCheckResponse>("/api/v1/radio/check", {
    method: "POST",
    body: payload,
  });
}

export async function streamRadioTrack(trackId: string) {
  return api<Blob>(`/api/v1/radio/stream/${trackId}`, {
    responseType: "blob",
  });
}

export function getRadioStreamUrl(trackId: string) {
  return buildApiUrl(`/api/v1/radio/stream/${trackId}`);
}