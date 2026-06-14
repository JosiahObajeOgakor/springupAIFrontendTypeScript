import { create } from 'zustand';

/**
 * Minor cross-component chat UI state (bubble open/closed, last WhatsApp handoff
 * result). Pure single-component form inputs (e.g. the phone field) stay local —
 * only state shared between the bubble and the start card lives here.
 */
export interface ChatHandoff {
  /** wa.me deep link to continue on WhatsApp, or null if not configured. */
  whatsappUrl: string | null;
}

interface ChatState {
  isBubbleOpen: boolean;
  lastHandoff: ChatHandoff | null;
  openBubble: () => void;
  closeBubble: () => void;
  toggleBubble: () => void;
  setHandoff: (handoff: ChatHandoff | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isBubbleOpen: false,
  lastHandoff: null,
  openBubble: () => set({ isBubbleOpen: true }),
  closeBubble: () => set({ isBubbleOpen: false }),
  toggleBubble: () => set((s) => ({ isBubbleOpen: !s.isBubbleOpen })),
  setHandoff: (lastHandoff) => set({ lastHandoff }),
}));
