'use client';

import { useEffect, useState } from 'react';
import { useUiStore, selectIsLoading } from '@/lib/stores/ui-store';

export function GlobalSpinner() {
  const isLoading = useUiStore(selectIsLoading);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setVisible(true);
      return;
    }
    setVisible(false);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!loading) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top progress bar */}
      <div className="h-[3px] w-full bg-primary/10 overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[indeterminate_1.2s_ease-in-out_infinite] w-1/3" />
      </div>

      {/* Center spinner overlay — only on longer loads */}
      <div
        className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
