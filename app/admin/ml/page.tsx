'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { getMlMetrics, createMlRule, updateMlRule } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type Rule = { rule_id?: string; rule_type: string; condition: string; action: string };

export default function AdminMlPage() {
  const [metrics, setMetrics] = useState<unknown>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [form, setForm] = useState<Rule>({ rule_type: 'spam', condition: '', action: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadMetrics() {
    setLoadingMetrics(true);
    try { setMetrics(await getMlMetrics()); } catch { toast.error('Could not load ML metrics.'); }
    finally { setLoadingMetrics(false); }
  }

  useEffect(() => { void loadMetrics(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.condition.trim() || !form.action.trim()) { toast.error('Condition and action are required.'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await updateMlRule({ rule_id: editId, condition: form.condition.trim(), action: form.action.trim() });
        toast.success('Rule updated.');
      } else {
        await createMlRule({ rule_type: form.rule_type, condition: form.condition.trim(), action: form.action.trim() });
        toast.success('Rule created.');
      }
      setForm({ rule_type: 'spam', condition: '', action: '' });
      setEditId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const metricEntries = metrics && typeof metrics === 'object'
    ? Object.entries(metrics as Record<string, unknown>).filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    : [];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">ML Moderation</h1>
        </div>

        {/* Metrics */}
        <Card className="rounded-3xl shadow-float">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Model metrics</CardTitle>
              <CardDescription>Live stats from the ML moderation system.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={loadMetrics} disabled={loadingMetrics}>
              {loadingMetrics ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            </Button>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : metricEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No metrics available.</p>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {metricEntries.map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                    <p className="text-xl font-bold tabular-nums">{String(v)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{k.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Rule form */}
        <Card className="rounded-3xl shadow-float">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlusCircle size={16} className="text-primary" />
              {editId ? 'Update rule' : 'Create rule'}
            </CardTitle>
            <CardDescription>
              {editId ? `Editing rule ${editId}` : 'Define a new ML moderation rule.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              {!editId && (
                <div className="space-y-1.5">
                  <Label htmlFor="rule-type">Rule type</Label>
                  <Select value={form.rule_type} onValueChange={(v) => setForm((p) => ({ ...p, rule_type: v }))}>
                    <SelectTrigger id="rule-type" className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {['spam', 'fraud', 'offensive', 'custom'].map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className={`space-y-1.5 ${!editId ? '' : 'sm:col-span-2'}`}>
                <Label htmlFor="rule-condition">Condition</Label>
                <Input
                  id="rule-condition"
                  className="rounded-2xl"
                  placeholder='e.g. score > 0.9'
                  value={form.condition}
                  onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rule-action">Action</Label>
                <Input
                  id="rule-action"
                  className="rounded-2xl"
                  placeholder='e.g. flag, block, notify_admin'
                  value={form.action}
                  onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                {editId && (
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditId(null); setForm({ rule_type: 'spam', condition: '', action: '' }); }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="rounded-full" disabled={submitting}>
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editId ? 'Update' : 'Create rule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
