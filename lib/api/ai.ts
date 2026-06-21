import { buildApiUrl } from "./client";
import { store } from "@/lib/store";
import type { AiStreamPayload } from "./types";

/**
 * POST /api/v1/ai/stream — SSE streaming AI assistant.
 *
 * The server streams Server-Sent Events. Caller iterates with a TextDecoderStream
 * or reads the raw Uint8Array stream:
 *
 *   const stream = await streamAi({ message: "Find a plumber in Lagos" });
 *   const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
 *   while (true) {
 *     const { done, value } = await reader.read();
 *     if (done) break;
 *     // Each `value` is a raw SSE line, e.g. "data: { ... }"
 *     processChunk(value);
 *   }
 */
export async function streamAi(payload: AiStreamPayload): Promise<ReadableStream<Uint8Array>> {
  const token = store.getState().auth.token;
  const res = await fetch(buildApiUrl("/api/v1/ai/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw Object.assign(new Error(`AI stream error ${res.status}`), { status: res.status, body });
  }

  if (!res.body) throw new Error("AI stream: response body is null");
  return res.body;
}
