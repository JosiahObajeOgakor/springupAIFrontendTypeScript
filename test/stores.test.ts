import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock sonner so the notification store can be asserted without a real toaster.
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { toast } from "sonner";
import { useUiStore } from "@/lib/stores/ui-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useNotificationStore } from "@/lib/stores/notification-store";

describe("ui-store", () => {
  beforeEach(() => useUiStore.setState({ inFlight: 0 }));

  it("counts in-flight requests and clamps at zero", () => {
    const { startLoading, endLoading } = useUiStore.getState();
    startLoading();
    startLoading();
    expect(useUiStore.getState().inFlight).toBe(2);
    endLoading();
    expect(useUiStore.getState().inFlight).toBe(1);
    endLoading();
    endLoading(); // extra end must not go negative
    expect(useUiStore.getState().inFlight).toBe(0);
  });
});

describe("chat-store", () => {
  beforeEach(() => useChatStore.setState({ isBubbleOpen: false, lastHandoff: null }));

  it("toggles the bubble and records the handoff", () => {
    const s = useChatStore.getState();
    s.toggleBubble();
    expect(useChatStore.getState().isBubbleOpen).toBe(true);
    s.closeBubble();
    expect(useChatStore.getState().isBubbleOpen).toBe(false);
    s.setHandoff({ whatsappUrl: "https://wa.me/234" });
    expect(useChatStore.getState().lastHandoff?.whatsappUrl).toContain("wa.me");
  });
});

describe("notification-store", () => {
  beforeEach(() => {
    useNotificationStore.setState({ history: [] });
    vi.clearAllMocks();
  });

  it("routes by type to sonner and records bounded history", () => {
    const { notify } = useNotificationStore.getState();
    notify({ type: "success", message: "Saved" });
    notify({ type: "error", message: "Failed" });
    notify({ message: "FYI" });

    expect(toast.success).toHaveBeenCalledWith("Saved", undefined);
    expect(toast.error).toHaveBeenCalledWith("Failed", undefined);
    expect(toast).toHaveBeenCalledWith("FYI", undefined);
    expect(useNotificationStore.getState().history).toHaveLength(3);
    // Most recent first.
    expect(useNotificationStore.getState().history[0].message).toBe("FYI");
  });

  it("caps history at 50 entries", () => {
    const { notify } = useNotificationStore.getState();
    for (let i = 0; i < 60; i++) notify({ message: `m${i}` });
    expect(useNotificationStore.getState().history).toHaveLength(50);
    expect(useNotificationStore.getState().history[0].message).toBe("m59");
  });
});
