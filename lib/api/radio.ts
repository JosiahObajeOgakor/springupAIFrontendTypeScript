import { api, buildApiUrl, uploadWithProgress } from "./client";
import type {
  RadioBatchUploadPayload,
  RadioCheckPayload,
  RadioCheckResponse,
  RadioPreloadManifest,
  RadioPresignBatchPayload,
  RadioPresignBatchResponse,
  RadioPresignPayload,
  RadioPresignResponse,
  RadioSingleUploadPayload,
  RadioTrack,
  RadioTrackCollectionResponse,
  RadioUploadCompletePayload,
  RadioUploadCompleteResponse,
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

// POST /api/v1/radio/check — spec v2.0.0 requires {session_id} in body.
// The legacy fields (current_track_id, played_track_ids, buffer_size) are
// accepted for backwards compat but session_id is the primary field.
export async function checkRadioBuffer(payload: RadioCheckPayload): Promise<RadioCheckResponse> {
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

// ─── Presigned S3 upload flow (faster than multipart proxy) ──────────────────

// Step 1: Get a presigned PUT URL for a single track.
export async function presignRadioUpload(
  payload: RadioPresignPayload,
): Promise<RadioPresignResponse> {
  return api<RadioPresignResponse>("/api/v1/radio/upload/presign", {
    method: "POST",
    body: payload,
  });
}

// Step 1 (batch): Get presigned PUT URLs for up to 10 tracks at once.
export async function presignRadioUploadBatch(
  payload: RadioPresignBatchPayload,
): Promise<RadioPresignBatchResponse> {
  return api<RadioPresignBatchResponse>("/api/v1/radio/upload/presign/batch", {
    method: "POST",
    body: payload,
  });
}

// Step 2: PUT the file directly to S3 (no gateway proxy).
// onProgress receives 0–100 percent derived from upload progress events.
export async function putRadioFileToS3(
  putUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 PUT failed: ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("S3 PUT network error")));
    xhr.open("PUT", putUrl);
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");
    xhr.send(file);
  });
}

// Step 3: Activate the track after the S3 PUT succeeds.
export async function completeRadioUpload(
  payload: RadioUploadCompletePayload,
): Promise<RadioUploadCompleteResponse> {
  return api<RadioUploadCompleteResponse>("/api/v1/radio/upload/complete", {
    method: "POST",
    body: payload,
  });
}