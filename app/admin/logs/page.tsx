'use client';

import { useCallback, useState } from 'react';
import { FileText, Loader2, RefreshCw } from 'lucide-react';
import { getEventLogs } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function AdminLogsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [logs, setLogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [queried, setQueried] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEventLogs({
        from: from || undefined,
        to: to || undefined,
      });
      const items = Array.isArray(res)
        ? res
        : res && typeof res === 'object' && 'items' in (res as object)
        ? (res as { items: unknown[] }).items
        : [res];
      setLogs(items ?? []);
      setQueried(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load event logs.');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Event Logs</h1>
        </div>

        <Card className="rounded-3xl shadow-float">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base">Filter</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <Label htmlFor="log-from">From</Label>
                <Input
                  id="log-from"
                  type="datetime-local"
                  className="rounded-2xl"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <Label htmlFor="log-to">To</Label>
                <Input
                  id="log-to"
                  type="datetime-local"
                  className="rounded-2xl"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <Button className="rounded-full shrink-0" onClick={load} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Fetch logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {queried && (
          <Card className="rounded-3xl shadow-float overflow-hidden">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Results
                <Badge variant="secondary" className="ml-2 text-xs">{logs.length} events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No events in this range.</p>
              ) : (
                <ScrollArea className="h-[60vh]">
                  <div className="divide-y divide-border">
                    {(logs as Record<string, unknown>[]).map((log, i) => (
                      <div key={i} className="px-5 py-3 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-start gap-3">
                          {log.type && (
                            <Badge variant="outline" className="text-xs shrink-0 capitalize mt-0.5">
                              {String(log.type)}
                            </Badge>
                          )}
                          <div className="flex-1 min-w-0">
                            {log.message && (
                              <p className="text-sm text-foreground leading-snug">{String(log.message)}</p>
                            )}
                            {log.created_at && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(String(log.created_at)).toLocaleString()}
                              </p>
                            )}
                            {!log.message && !log.type && (
                              <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(log, null, 2)}</pre>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
