'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { initiateChat, ApiError } from '@/lib/api';
import { formatNigerianPhone, parseNigerianPhone } from '@/lib/phone';
import { useAppSelector } from '@/lib/store/hooks';
import { selectVendor } from '@/lib/store/authSlice';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

export function ChatBubble() {
  return (
    <Suspense>
      <ChatBubbleInner />
    </Suspense>
  );
}

type ChatAudience = 'guest' | 'user' | 'vendor' | 'admin';

function resolveChatAudience(source: string): ChatAudience {
  switch (source) {
    case 'admin': return 'admin';
    case 'vendor': return 'vendor';
    case 'user': return 'user';
    default: return 'guest';
  }
}

function ChatBubbleInner() {
  const searchParams = useSearchParams();
  const vendor = useAppSelector(selectVendor);
  const source = searchParams.get('source') ?? 'guest';
  const audience = resolveChatAudience(source);

  const isOpen = useChatStore((s) => s.isBubbleOpen);
  const toggleBubble = useChatStore((s) => s.toggleBubble);
  const closeBubble = useChatStore((s) => s.closeBubble);
  const success = useChatStore((s) => s.lastHandoff);
  const setHandoff = useChatStore((s) => s.setHandoff);
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const storedPhone = (vendor as { phone?: string } | null)?.phone ?? '';
    if (!storedPhone) return;
    const parsed = parseNigerianPhone(storedPhone);
    if (parsed.isValid) setPhone(parsed.normalized);
  }, [vendor]);

  const whatsappHref = useMemo(() => {
    if (!WHATSAPP) return null;
    return `https://wa.me/${WHATSAPP}`;
  }, [WHATSAPP]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHandoff(null);

    const parsed = parseNigerianPhone(phone);
    if (!parsed.isValid) {
      setError(parsed.error ?? 'Enter a valid 11-digit Nigerian phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await initiateChat({
        phone: parsed.normalized,
        audience,
        source,
      });
      setHandoff({ whatsappUrl: response.whatsappUrl });
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Unable to start chat. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to start chat. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const overlays =
    mounted && isOpen
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-[2px] sm:bg-black/15 sm:backdrop-blur-0"
              onClick={closeBubble}
            />

            {/* Chat panel */}
            <div className="fixed z-[999] inset-x-3 bottom-24 sm:inset-x-auto sm:bottom-24 sm:left-4 sm:w-[22rem]">
              <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                {/* Header */}
                <div className="gradient-primary px-5 py-4 text-white relative">
                  <button
                    type="button"
                    onClick={closeBubble}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">SpringUpAI Chat</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <p className="text-[11px] text-white/70">Online — reply instantly</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                  {success ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-semibold">You&apos;re all set!</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Continue on WhatsApp — tell us what you need: fix, pay, or book anything.
                      </p>
                      {(success.whatsappUrl ?? whatsappHref) ? (
                        <a
                          href={(success.whatsappUrl ?? whatsappHref)!}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                          Continue on WhatsApp <ArrowRight size={14} />
                        </a>
                      ) : (
                        <p className="text-xs text-amber-600">
                          WhatsApp is not configured yet. Add NEXT_PUBLIC_WHATSAPP_NUMBER to enable the handoff.
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm">
                          Hi there! Need to fix, pay, or book something? Enter your phone and let&apos;s get started.
                        </p>
                      </div>

                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={formatNigerianPhone(phone)}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0801 234 5678"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        />
                      </div>

                      {error && <p className="text-xs text-red-600">{error}</p>}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={14} /> Start Chat
                          </>
                        )}
                      </button>

                      {whatsappHref && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full px-4 py-3 border border-border rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary/50 transition"
                        >
                          <MessageCircle size={14} className="text-green-600" /> WhatsApp instead
                        </a>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {overlays}

      {/* Circle button — lives in the parent flex stack */}
      <div className="relative animate-[bubble-float_3s_ease-in-out_infinite]">
        <button
          type="button"
          onClick={toggleBubble}
          className={cn(
            'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all',
            isOpen
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary text-primary-foreground hover:scale-110 active:scale-95'
          )}
          aria-label="Chat with SpringUpAI"
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </button>

        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse pointer-events-none" />
        )}
      </div>
    </>
  );
}
