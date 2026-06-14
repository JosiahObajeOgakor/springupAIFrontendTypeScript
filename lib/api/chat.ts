import { ApiError } from './client';
import { store } from '@/lib/store';
import { login, registerUser } from './auth';
import { normalizePhone } from '@/lib/phone';
import type { ChatInitPayload, ChatInitResponse } from './types';

// The AnythingAI Gateway has NO synchronous web-chat / mediation API. Its only
// conversational channel is WhatsApp (the server-side Meta webhook at
// /api/v1/webhook/whatsapp auto-registers users by phone). So the web "chat"
// entry point is a lead-capture + handoff: we make sure the phone has a user
// account (mirroring the WhatsApp auto-register), then hand the visitor off to
// WhatsApp to continue the conversation.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

function buildWhatsAppUrl(payload: ChatInitPayload): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const greeting =
    payload.audience === 'vendor'
      ? 'Hi SpringUpAI, I am a vendor and I need some help.'
      : payload.audience === 'admin'
        ? 'Hi SpringUpAI, this is an admin enquiry.'
        : 'Hi SpringUpAI, I need to fix, pay or book something.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

/**
 * Start a web-chat handoff for any audience.
 *
 * Ensures the phone maps to a user account (auto-registering when the phone is
 * new, mirroring the WhatsApp auto-register flow), then returns a WhatsApp deep
 * link the caller continues the conversation on.
 */
export async function initiateChat(payload: ChatInitPayload): Promise<ChatInitResponse> {
  const phone = normalizePhone(payload.phone);
  let registered = false;

  if (!store.getState().auth.isAuthenticated) {
    try {
      await login(phone);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Unknown phone → create the user, then continue with the new session.
        await registerUser({ phone, name: phone });
        registered = true;
      } else {
        throw err;
      }
    }
  }

  return { registered, whatsappUrl: buildWhatsAppUrl(payload) };
}
