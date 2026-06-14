import { describe, it, expect } from "vitest";
import {
  preloadRadioTracks,
  checkRadioBuffer,
  listRadioTracks,
  uploadRadioTrack,
  getRadioStreamUrl,
} from "@/lib/api/radio";
import { setAuthToken, mockResponse, lastRequest, jsonBody, formBody, pathOf, API_BASE } from "./utils";

describe("radio module", () => {
  it("preloadRadioTracks GETs the preload manifest", async () => {
    setAuthToken("r-tok");
    mockResponse({
      body: { session_id: "s1", next_check_at: 8, tracks: [{ id: "t1", title: "Song", stream_url: "https://cdn/t1", index: 0 }] },
    });

    const manifest = await preloadRadioTracks();

    expect(pathOf()).toBe("/api/v1/radio/preload");
    expect(manifest.session_id).toBe("s1");
    expect(manifest.tracks).toHaveLength(1);
  });

  it("checkRadioBuffer POSTs the session id at the purchase gate", async () => {
    setAuthToken("r-tok");
    mockResponse({ body: { action: "continue", manifest: {} } });

    const res = await checkRadioBuffer({ session_id: "s1" });

    expect(pathOf()).toBe("/api/v1/radio/check");
    expect(jsonBody()).toEqual({ session_id: "s1" });
    expect(res.action).toBe("continue");
  });

  it("listRadioTracks normalises a bare array response", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: [{ id: "t1", title: "A" }, { id: "t2", title: "B" }] });

    const tracks = await listRadioTracks();

    expect(pathOf()).toBe("/api/v1/radio/tracks");
    expect(tracks.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("listRadioTracks normalises a { tracks: [...] } envelope", async () => {
    setAuthToken("admin-tok");
    mockResponse({ body: { tracks: [{ id: "t9", title: "Z" }] } });

    const tracks = await listRadioTracks();
    expect(tracks[0].id).toBe("t9");
  });

  it("uploadRadioTrack (no progress callback) POSTs multipart form data", async () => {
    setAuthToken("admin-tok");
    mockResponse({ status: 201, body: { track_id: "t1", status: "uploaded" } });

    const file = new File(["audio-bytes"], "song.mp3", { type: "audio/mpeg" });
    await uploadRadioTrack({ file, title: "My Song", artist: "DJ" });

    const req = lastRequest();
    expect(pathOf(req)).toBe("/api/v1/radio/upload");
    const form = formBody(req);
    expect(form.get("title")).toBe("My Song");
    expect(form.get("artist")).toBe("DJ");
    expect(form.get("file")).toBeInstanceOf(File);
    // Multipart bodies must NOT carry a forced JSON content-type.
    expect(req.headers["Content-Type"]).toBeUndefined();
  });

  it("getRadioStreamUrl builds an absolute gateway URL for the <audio> src", () => {
    expect(getRadioStreamUrl("t1")).toBe(`${API_BASE}/api/v1/radio/stream/t1`);
  });
});
