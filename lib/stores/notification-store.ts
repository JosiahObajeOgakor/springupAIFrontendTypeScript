import { create } from 'zustand';
import { toast } from 'sonner';

/**
 * One app-wide notification API. `notify()` surfaces a sonner toast (the toast
 * system already mounted in app/layout.tsx) AND records it in a bounded history
 * array so a future notification center / bell can read past notifications.
 *
 * Usage in React:        const notify = useNotificationStore((s) => s.notify)
 * Usage outside React:   useNotificationStore.getState().notify({ ... })
 */
export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationInput {
  type?: NotificationType;
  message: string;
  description?: string;
}

export interface NotificationRecord extends NotificationInput {
  id: string;
  type: NotificationType;
  createdAt: number;
}

const HISTORY_CAP = 50;

interface NotificationState {
  history: NotificationRecord[];
  notify: (input: NotificationInput) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  history: [],
  notify: ({ type = 'info', message, description }) => {
    const opts = description ? { description } : undefined;
    if (type === 'success') toast.success(message, opts);
    else if (type === 'error') toast.error(message, opts);
    else toast(message, opts);

    const record: NotificationRecord = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      message,
      description,
      createdAt: Date.now(),
    };
    set((s) => ({ history: [record, ...s.history].slice(0, HISTORY_CAP) }));
  },
  clear: () => set({ history: [] }),
}));

/** Imperative helper for non-component code (api layer, utilities). */
export const notify = (input: NotificationInput) =>
  useNotificationStore.getState().notify(input);
