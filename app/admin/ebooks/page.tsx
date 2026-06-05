'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { reviewEbookAdvance } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Decision = 'approve' | 'reject';

export default function AdminEbooksPage() {
  const [requestId, setRequestId] = useState('');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<{ id: string; decision: Decision } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestId.trim()) { setError('Request ID is required.'); return; }
    if (!decision) { setError('Select approve or reject before submitting.'); return; }
    if (decision === 'reject' && !reason.trim()) {
      setError('A reason is required when rejecting an advance request.');
      return;
    }

    setLoading(true);
    setError('');
    setLastResult(null);

    try {
      await reviewEbookAdvance({
        request_id: requestId.trim(),
        decision,
        reason: reason.trim() || undefined,
      });

      const id = requestId.trim();
      setLastResult({ id, decision });
      toast.success(`Advance request ${id} ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      setRequestId('');
      setDecision(null);
      setReason('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Review submission failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Ebook Advances</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Approve or reject vendor advance requests via{' '}
            <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">POST /api/v1/ebook/advance/review</code>.
            Vendors may request up to 40% of ebook earnings in advance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Review form */}
          <Card className="rounded-3xl shadow-float">
            <CardHeader>
              <CardTitle>Review advance request</CardTitle>
              <CardDescription>
                Enter the vendor&apos;s advance request ID, choose a decision, and optionally provide a reason.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="request-id">Advance request ID</Label>
                  <Input
                    id="request-id"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    placeholder="e.g. req_abc123"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Decision</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('approve')}
                      className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-colors text-left ${
                        decision === 'approve'
                          ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                          : 'border-border hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20'
                      }`}
                    >
                      <CheckCircle2 size={16} className={decision === 'approve' ? 'text-green-600' : 'text-muted-foreground'} />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('reject')}
                      className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-colors text-left ${
                        decision === 'reject'
                          ? 'border-destructive bg-destructive/5 text-destructive'
                          : 'border-border hover:border-destructive/30 hover:bg-destructive/5'
                      }`}
                    >
                      <XCircle size={16} className={decision === 'reject' ? 'text-destructive' : 'text-muted-foreground'} />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Reason{' '}
                    <span className="text-muted-foreground font-normal">
                      {decision === 'reject' ? '(required)' : '(optional)'}
                    </span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide context for the vendor..."
                    className="rounded-2xl resize-none min-h-[90px]"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Review failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-full"
                    disabled={loading || !decision}
                    variant={decision === 'reject' ? 'destructive' : 'default'}
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {decision === 'approve' ? 'Approve advance' : decision === 'reject' ? 'Reject advance' : 'Submit review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info + last result */}
          <div className="space-y-4">
            {lastResult && (
              <Card className={`rounded-3xl border-2 ${lastResult.decision === 'approve' ? 'border-green-500/40 bg-green-50/50 dark:bg-green-950/20' : 'border-destructive/30 bg-destructive/5'}`}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    {lastResult.decision === 'approve'
                      ? <CheckCircle2 size={16} className="text-green-600" />
                      : <XCircle size={16} className="text-destructive" />}
                    <p className="text-sm font-semibold">
                      {lastResult.decision === 'approve' ? 'Approved' : 'Rejected'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono break-all">{lastResult.id}</p>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl shadow-float">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">How advances work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Vendors may request up to <Badge variant="secondary">40%</Badge> of their projected ebook earnings before payout.</p>
                <p>Once approved, the advance is deducted from the next settlement cycle automatically.</p>
                <p>Rejected requests return to <Badge variant="secondary">pending</Badge> and the vendor is notified.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
