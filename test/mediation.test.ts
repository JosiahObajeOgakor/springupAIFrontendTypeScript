import { describe, it, expect } from "vitest";
import { openConversation, sendMessage, getConversations } from "@/lib/api/mediation";
import { setAuthToken, mockResponse, lastRequest, jsonBody, pathOf } from "./utils";

describe("mediation / messaging module", () => {
  it("openConversation POSTs the participant and returns a conversation", async () => {
    setAuthToken("md-tok");
    mockResponse({ body: { id: "conv-1", participant_id: "v1", subject: "AC repair" } });

    const res = await openConversation({ participant_id: "v1", subject: "AC repair" });

    expect(pathOf()).toBe("/api/v1/mediation/conversations/open");
    expect(jsonBody()).toMatchObject({ participant_id: "v1" });
    expect(res.id).toBe("conv-1");
  });

  it("sendMessage relays content to a conversation", async () => {
    setAuthToken("md-tok");
    mockResponse({ body: { id: "m1", conversation_id: "conv-1", sender_id: "u1", content: "Hi", created_at: "now" } });

    const res = await sendMessage({ conversation_id: "conv-1", content: "Hi" });

    expect(pathOf()).toBe("/api/v1/mediation/messages/relay");
    expect(jsonBody()).toEqual({ conversation_id: "conv-1", content: "Hi" });
    expect(res.content).toBe("Hi");
  });

  it("getConversations GETs the conversation list", async () => {
    setAuthToken("md-tok");
    mockResponse({ body: [{ id: "conv-1", participant_id: "v1" }] });

    const res = await getConversations();

    expect(lastRequest().method).toBe("GET");
    expect(pathOf()).toBe("/api/v1/mediation/conversations");
    expect(res).toHaveLength(1);
  });
});
