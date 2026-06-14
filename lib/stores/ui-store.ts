import { create } from 'zustand';

/**
 * Minor (ephemeral) global UI state. Lives in Zustand, NOT Redux — Redux is
 * reserved for the core, persisted auth/session slice.
 *
 * `inFlight` tracks how many API requests are currently running so a single
 * global progress indicator can render. Replaces the old bespoke
 * `onLoadingChange` listener in lib/api/client.ts.
 */
interface UiState {
  inFlight: number;
  startLoading: () => void;
  endLoading: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  inFlight: 0,
  startLoading: () => set((s) => ({ inFlight: s.inFlight + 1 })),
  endLoading: () => set((s) => ({ inFlight: Math.max(0, s.inFlight - 1) })),
}));

/** Convenience selector for components: `useUiStore(selectIsLoading)`. */
export const selectIsLoading = (s: UiState) => s.inFlight > 0;
