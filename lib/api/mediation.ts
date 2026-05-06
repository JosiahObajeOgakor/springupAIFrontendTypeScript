import { api } from "./client";
import type {
  OpenConversationPayload,
  Conversation,
  SendMessagePayload,
  Message,
} from "./types";

export async function openConversation(payload: OpenConversationPayload) {
  return api<Conversation>("/api/v1/mediation/conversations/open", {
    method: "POST",
    body: payload,
  });
}

export async function sendMessage(payload: SendMessagePayload) {
  return api<Message>("/api/v1/mediation/messages/relay", {
    method: "POST",
    body: payload,
  });
}

export async function getConversations() {
  return api<Conversation[]>("/api/v1/mediation/conversations");
}
