'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Star, Wallet } from 'lucide-react';
import {
  getEscrow,
  getEscrowStatus,
  markEscrowFunded,
  startService,
  confirmEscrow,
  confirmSatisfaction,
  raiseDispute,
  refundEscrow,
} from '@/lib/api';
import type { EscrowResponse } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const STATUS_STEPS = [
  'open', 'funded', 'in_progress', 'delivered', 'confirmed', 'disputed', 'resolved', 'refunded',
];

function statusIndex(status: string) {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'confirmed' || status === 'resolved' ? 'default'
    : status === 'disputed' || status === 'refunded' ? 'destructive'
    : 'secondary';
  return <Badge variant={variant} className="capitalize text-xs">{status}</Badge>;
}

export function EscrowLifecycleCard() {
  const [escrowId, setEscrowId] = useState('');
  const [escrow, setEscrow] = useState<EscrowResponse | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  // Satisfaction fields
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const refresh = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [detail, stat] = await Promise.all([
        getEscrow(id),
        getEscrowStatus(id),
      ]);
      setEscrow(detail);
      setStatus(stat.status);
    } catch {
      toast.error('Could not load escrow.');
    } finally {
      setLoading(false);
    }
  }, []);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!escrowId.trim()) return;
    await refresh(escrowId.trim());
  }

  async function doAction(label: string, fn: () => Promise<unknown>) {
    setActionLoading(label);
    try {
      await fn();
      toast.success(`${label} — done.`);
      await refresh(escrowId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed.`);
    } finally {
      setActionLoading('');
    }
  }

  const id = escrow?.escrow_id ?? '';

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Wallet size={16} className="text-primary" />
        </div>
        <CardTitle>Escrow Lifecycle</CardTitle>
        <CardDescription>
          Look up an escrow by ID and advance it through each step.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={lookup} className="flex gap-2">
          <Input
            className="rounded-2xl flex-1"
            placeholder="escrow_id"
            value={escrowId}
            onChange={(e) => setEscrowId(e.target.value)}
          />
          <Button type="submit" className="rounded-full shrink-0" disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Load'}
          </Button>
        </form>

        {escrow && (
          <>
            {/* Status timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current status</span>
                <StatusBadge status={status || escrow.status} />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {STATUS_STEPS.slice(0, 6).map((step, i) => (
                  <div
                    key={step}
                    className={`flex-1 min-w-[52px] h-1.5 rounded-full transition-colors ${
                      i <= statusIndex(status || escrow.status)
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Amount: <span className="font-semibold text-foreground">₦{(escrow.amount / 100).toLocaleString()}</span>
                {escrow.description && ` · ${escrow.description}`}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm" variant="outline" className="rounded-full text-xs"
                  disabled={!!actionLoading}
                  onClick={() => doAction('Mark funded', () => markEscrowFunded({ escrow_id: id }))}
                >
                  {actionLoading === 'Mark funded' ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />}
                  Mark Funded
                </Button>
                <Button
                  size="sm" variant="outline" className="rounded-full text-xs"
                  disabled={!!actionLoading}
                  onClick={() => doAction('Start service', () => startService({ escrow_id: id }))}
                >
                  {actionLoading === 'Start service' ? <Loader2 size={12} className="animate-spin" /> : null}
                  Start Service
                </Button>
                <Button
                  size="sm" variant="outline" className="rounded-full text-xs text-green-600 border-green-200"
                  disabled={!!actionLoading}
                  onClick={() => doAction('Confirm delivery', () => confirmEscrow({ escrow_id: id }))}
                >
                  <CheckCircle2 size={12} /> Confirm Delivery
                </Button>
                <Button
                  size="sm" variant="outline" className="rounded-full text-xs text-amber-600 border-amber-200"
                  disabled={!!actionLoading}
                  onClick={() => doAction('Refund', () => refundEscrow({ escrow_id: id }))}
                >
                  Refund
                </Button>
              </div>

              {/* Confirm satisfaction */}
              <div className="rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star size={14} className="text-amber-500" /> Confirm satisfaction
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Rating: {rating}/5</Label>
                  <Slider min={1} max={5} step={1} value={[rating]} onValueChange={([v]) => setRating(v)} className="w-full" />
                </div>
                <Textarea
                  className="rounded-xl resize-none text-sm"
                  rows={2}
                  placeholder="Optional feedback…"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <Button
                  size="sm" className="rounded-full w-full" variant="outline"
                  disabled={!!actionLoading}
                  onClick={() => doAction('Confirm satisfaction', () =>
                    confirmSatisfaction({ escrow_id: id, rating, feedback: feedback || undefined })
                  )}
                >
                  {actionLoading === 'Confirm satisfaction' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                  Submit Rating
                </Button>
              </div>

              {/* Raise dispute */}
              <div className="rounded-2xl border border-destructive/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle size={14} /> Raise dispute
                </div>
                <Textarea
                  className="rounded-xl resize-none text-sm"
                  rows={2}
                  placeholder="Describe the issue…"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                />
                <Button
                  size="sm" variant="destructive" className="rounded-full w-full"
                  disabled={!!actionLoading || !disputeReason.trim()}
                  onClick={() => doAction('Raise dispute', () =>
                    raiseDispute({ escrow_id: id, reason: disputeReason })
                  )}
                >
                  {actionLoading === 'Raise dispute' ? <Loader2 size={12} className="animate-spin" /> : null}
                  Raise Dispute
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
