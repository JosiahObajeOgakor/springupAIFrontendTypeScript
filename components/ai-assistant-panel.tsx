'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import { streamAi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function parseSSEChunk(raw: string): string {
  // SSE lines look like: "data: { ... }" or "data: text"
  const lines = raw.split('\n');
  let out = '';
  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') continue;
    try {
      const parsed = JSON.parse(payload);
      // OpenAI-style delta or plain text
      const delta =
        parsed?.choices?.[0]?.delta?.content ??
        parsed?.content ??
        parsed?.text ??
        (typeof parsed === 'string' ? parsed : '');
      out += delta;
    } catch {
      out += payload;
    }
  }
  return out;
}

export function AiAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setStreaming(true);

    // Placeholder for the assistant reply
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = await streamAi({ message: text, session_id: sessionIdRef.current });
      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        // Process complete SSE events (terminated by double newline)
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const event of events) {
          const chunk = parseSSEChunk(event);
          if (chunk) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: last.content + chunk };
              }
              return updated;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Something went wrong.'}`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all',
          'bg-gradient-to-br from-violet-600 to-primary text-white hover:scale-110 active:scale-95',
          'animate-[bubble-float_3s_ease-in-out_1s_infinite]',
        )}
        aria-label="AI Assistant"
      >
        <Sparkles size={22} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-lg h-[75vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-violet-600/10 to-primary/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-primary flex items-center justify-center">
                <Bot size={17} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">SpringUpAI Assistant</p>
                <p className="text-[11px] text-muted-foreground">Find services · check balance · place orders</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Sparkles size={32} className="text-primary/40" />
                  <p className="text-sm text-muted-foreground">
                    Ask me anything — I can find vendors, check your wallet, book services, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {[
                      'Find a plumber in Lagos under ₦5,000',
                      "What's my wallet balance?",
                      'Book a generator repair',
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setInput(s); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-primary flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm',
                      msg.role === 'assistant' && !msg.content && 'animate-pulse',
                    )}
                  >
                    {msg.content || (msg.role === 'assistant' && streaming ? '…' : '')}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-border">
              <input
                type="text"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="Ask me anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={streaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              >
                {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
