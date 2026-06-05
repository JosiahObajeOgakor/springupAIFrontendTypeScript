'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { initiateChat, ApiError } from '@/lib/api';
import { formatNigerianPhone, parseNigerianPhone } from '@/lib/phone';

const DIRECT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

type ChatAudience = 'guest' | 'vendor';
type ChatPreference = 'webchat' | 'whatsapp';

function getStoredVendorPhone() {
  if (typeof window === 'undefined') return '';

  const vendorRaw = localStorage.getItem('vendor');
  if (!vendorRaw) return '';

  try {
    const vendor = JSON.parse(vendorRaw) as { phone?: string };
    return vendor.phone ?? '';
  } catch {
    return '';
  }
}

export function ChatStartCard() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') ?? 'guest';
  const audience: ChatAudience = source === 'vendor' ? 'vendor' : 'guest';
  const [preference, setPreference] = useState<ChatPreference>('webchat');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<null | { conversationId: string; normalizedPhone: string }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedPhone = getStoredVendorPhone();
    if (!storedPhone) return;

    const parsed = parseNigerianPhone(storedPhone);
    if (parsed.isValid) {
      setPhone(parsed.normalized);
    }
  }, []);

  const whatsappHref = useMemo(() => {
    if (!DIRECT_WHATSAPP_NUMBER) return null;
    return `https://wa.me/${DIRECT_WHATSAPP_NUMBER}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const parsed = parseNigerianPhone(phone);
    if (!parsed.isValid) {
      setError(parsed.error ?? 'Enter a valid 11 digit Nigerian phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await initiateChat({
        phone: parsed.normalized,
        audience,
        source,
      });

      setPhone(parsed.normalized);
      setSuccess({
        conversationId: response.conversationId,
        normalizedPhone: parsed.normalized,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Unable to start chat right now. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to start chat right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl shadow-float overflow-hidden">
      <div className="gradient-primary px-6 py-7 sm:px-8 text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
          <MessageCircle size={22} className="text-white" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
          {audience === 'vendor' ? 'Vendor chat access' : 'Instant chat access'}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Start your SpringUpAI chat</h1>
        <p className="text-sm sm:text-base text-white/80 max-w-xl">
          Enter a valid 11 digit Nigerian phone number to open a web chat session. The final backend endpoint can be swapped in without changing this flow.
        </p>
      </div>

      <div className="p-6 sm:p-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-3">How would you like to continue?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreference('webchat');
                    setError('');
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    preference === 'webchat'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-secondary/40'
                  }`}
                >
                  <span className="block text-sm font-semibold mb-1">Web chat</span>
                  <span className="block text-sm text-muted-foreground">Enter your phone number and start the shared in-site chat flow.</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreference('whatsapp');
                    setError('');
                    setSuccess(null);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    preference === 'whatsapp'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-secondary/40'
                  }`}
                >
                  <span className="block text-sm font-semibold mb-1">Direct WhatsApp</span>
                  <span className="block text-sm text-muted-foreground">Skip the web flow and jump straight into WhatsApp with one tap.</span>
                </button>
              </div>
            </div>

            {preference === 'webchat' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="chat-phone" className="block text-sm font-medium mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="chat-phone"
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={formatNigerianPhone(phone)}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0801 234 5678"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">We currently accept local Nigerian mobile numbers in 11 digit format.</p>
                </div>

                {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

                {success && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    Chat initiated for {success.normalizedPhone}. Conversation ID: <span className="font-semibold">{success.conversationId}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Starting chat...
                    </>
                  ) : (
                    <>
                      Start Web Chat <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Direct WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    This option opens WhatsApp immediately. Use it when you want the fastest handoff without starting in web chat first.
                  </p>
                </div>

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2 shadow-elevated"
                  >
                    <MessageCircle size={18} /> Open WhatsApp
                  </a>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Direct WhatsApp is not configured yet. Add <span className="font-semibold">NEXT_PUBLIC_WHATSAPP_NUMBER</span> to enable this option.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-secondary/40 p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div>
            <p className="text-sm font-semibold mb-2">How this is wired</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>1. Users choose between web chat and direct WhatsApp before committing to a channel.</p>
              <p>2. Web chat normalizes and validates the phone number before any network request.</p>
              <p>3. The shared API wrapper only handles web chat, while direct WhatsApp stays available as a fast fallback.</p>
            </div>
          </div>

          <div className="space-y-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-full px-5 py-3 border border-border rounded-2xl bg-background hover:bg-card transition inline-flex items-center justify-center gap-2 font-medium"
              >
                <MessageCircle size={18} className="text-green-600" />
                Open WhatsApp directly
              </a>
            )}
            <Link
              href={audience === 'vendor' ? '/vendor/dashboard' : '/'}
              className="w-full px-5 py-3 text-center border border-border rounded-2xl hover:bg-background transition inline-flex items-center justify-center gap-2 font-medium"
            >
              Back to {audience === 'vendor' ? 'vendor dashboard' : 'homepage'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}