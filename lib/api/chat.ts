import { api } from './client';
import type { ChatInitApiResponse, ChatInitPayload, ChatInitResponse } from './types';

const CHAT_INIT_PATH = process.env.NEXT_PUBLIC_CHAT_INIT_PATH;

export async function initiateChat(payload: ChatInitPayload) {
  if (!CHAT_INIT_PATH) {
    throw new Error('Missing NEXT_PUBLIC_CHAT_INIT_PATH configuration');
  }

  const response = await api<ChatInitApiResponse>(CHAT_INIT_PATH, {
    method: 'POST',
    body: payload,
    noAuth: true,
  });

  const conversationId = response.conversationId ?? response.conversation_id ?? response.sessionId ?? response.session_id;

  if (!conversationId) {
    throw new Error('Chat API response is missing a conversation identifier');
  }

  return { conversationId } satisfies ChatInitResponse;
}