'use client';

import { useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { cn } from '@/lib/utils';

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

function timeAgo(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const history = useNotificationStore((s) => s.history);
  const clear = useNotificationStore((s) => s.clear);
  const [open, setOpen] = useState(false);

  const unread = history.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Notifications</span>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
                  >
                    <CheckCheck size={12} /> Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {history.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                history.map((n) => (
                  <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', TYPE_STYLES[n.type] ?? 'bg-gray-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{n.message}</p>
                      {n.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
