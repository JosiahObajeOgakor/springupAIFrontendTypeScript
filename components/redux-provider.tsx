'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { ApiError } from '@/lib/api';
import { notify } from '@/lib/stores/notification-store';

/** Mount once at the top of the tree to catch any unhandled ApiError rejections. */
function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for offline/PWA support.
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failure is non-fatal — ignore silently.
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const err = event.reason;
      if (err instanceof ApiError) {
        // 401 is handled by the client's queueRefresh → redirect; skip here.
        if (err.status === 401) return;
        const body = err.body as Record<string, unknown> | null;
        const message =
          (body?.error as string) ??
          (body?.message as string) ??
          `Request failed (${err.status})`;
        notify({ type: 'error', message });
        event.preventDefault(); // suppress console error for handled cases
      }
    }
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </PersistGate>
    </Provider>
  );
}
