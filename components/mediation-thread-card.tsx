'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { openConversation, sendMessage, getConversations } from '@/lib/api';
import type { Conversation, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// The mediation API returns conversation_id from open, then messages from relay.
// We keep a local optimistic message list per conversation.

export function MediationThreadCard({ escrowId }: { escrowId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [openMsg, setOpenMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [opening, setOpening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getConversations();
      setConversations(list);
    } catch {
      toast.error('Could not load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    if (!openMsg.trim()) return;
    setOpening(true);
    try {
      const conv = await openConversation({
        participant_id: escrowId ?? 'unknown',
        subject: openMsg.trim(),
      });
      setConversations((p) => [conv, ...p]);
      setActiveId(conv.id);
      setMessages([]);
      setOpenMsg('');
      toast.success('Mediation conversation opened.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open conversation.');
    } finally {
      setOpening(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    const content = text.trim();
    setText('');
    // Optimistic
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: activeId,
      sender_id: 'me',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, optimistic]);
    setSending(true);
    try {
      await sendMessage({ conversation_id: activeId, message: content });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Message failed.');
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <CardTitle>Mediation</CardTitle>
        <CardDescription>
          {escrowId ? `Dispute thread for escrow ${escrowId.slice(0, 12)}…` : 'All mediation conversations.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Open new conversation */}
        <form onSubmit={handleOpen} className="flex gap-2">
          <Input
            className="rounded-2xl flex-1 text-sm"
            placeholder="Describe the issue to open a new thread…"
            value={openMsg}
            onChange={(e) => setOpenMsg(e.target.value)}
          />
          <Button type="submit" size="sm" className="rounded-full shrink-0" disabled={opening || !openMsg.trim()}>
            {opening ? <Loader2 size={13} className="animate-spin" /> : 'Open'}
          </Button>
        </form>

        {/* Conversation list */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No conversations yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setActiveId(c.id); setMessages([]); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors truncate max-w-[180px] ${
                  activeId === c.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'
                }`}
              >
                {c.subject ?? c.id.slice(0, 12)}
              </button>
            ))}
          </div>
        )}

        {/* Thread */}
        {activeId && (
          <>
            <Separator />
            <ScrollArea className="h-52">
              <div className="space-y-3 pr-2">
                {messages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Send the first one.</p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === 'me' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary rounded-bl-sm'}`}>
                      {m.content}
                      <p className="text-[10px] opacity-50 mt-0.5">{new Date(m.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                className="rounded-2xl flex-1 text-sm"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={sending || !text.trim()}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
