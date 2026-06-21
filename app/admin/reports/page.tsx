'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import {
  getRevenueReport,
  getPurchaseReport,
  getEscrowReport,
  getSettlementsReport,
  getCommissionsReport,
  getEngagementReport,
  getOnlineReport,
  getSuspensionsReport,
  getKycReport,
  getPendingPaymentsReport,
  getResolutionsReport,
} from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type ReportKey =
  | 'revenue'
  | 'purchases'
  | 'escrow'
  | 'settlements'
  | 'commissions'
  | 'engagement'
  | 'online'
  | 'suspensions'
  | 'kyc'
  | 'pending-payments'
  | 'resolutions';

const REPORTS: { key: ReportKey; label: string; fetch: () => Promise<unknown> }[] = [
  { key: 'revenue',          label: 'Revenue',          fetch: getRevenueReport },
  { key: 'purchases',        label: 'Purchases',        fetch: getPurchaseReport },
  { key: 'escrow',           label: 'Escrow',           fetch: getEscrowReport },
  { key: 'settlements',      label: 'Settlements',      fetch: getSettlementsReport },
  { key: 'commissions',      label: 'Commissions',      fetch: getCommissionsReport },
  { key: 'engagement',       label: 'Engagement',       fetch: getEngagementReport },
  { key: 'online',           label: 'Online',           fetch: getOnlineReport },
  { key: 'suspensions',      label: 'Suspensions',      fetch: getSuspensionsReport },
  { key: 'kyc',              label: 'KYC',              fetch: getKycReport },
  { key: 'pending-payments', label: 'Pending Payments', fetch: getPendingPaymentsReport },
  { key: 'resolutions',      label: 'Resolutions',      fetch: getResolutionsReport },
];

function ReportPanel({ reportKey, fetch }: { reportKey: ReportKey; fetch: () => Promise<unknown> }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch();
      setData(res);
      setLoaded(true);
    } catch {
      toast.error(`Failed to load ${reportKey} report.`);
    } finally {
      setLoading(false);
    }
  }, [fetch, reportKey]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading report…</span>
      </div>
    );
  }

  if (!loaded) return null;

  const rows = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'items' in (data as object)
    ? (data as { items: unknown[] }).items
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="rounded-full" onClick={load} disabled={loading}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {rows ? (
        rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No data available.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  {Object.keys(rows[0] as object).map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap capitalize">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows as Record<string, unknown>[]).map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-secondary/20">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2.5 font-mono text-xs">
                        {val === null || val === undefined ? '—' : typeof val === 'boolean' ? (
                          <Badge variant={val ? 'default' : 'secondary'} className="text-xs">{val ? 'Yes' : 'No'}</Badge>
                        ) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <pre className="bg-secondary/30 rounded-2xl p-4 text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          Live data from all report endpoints. Refreshes on tab switch.
        </p>

        <Card className="rounded-3xl shadow-float overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">All Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="revenue">
              <TabsList className="flex-wrap h-auto gap-1 mb-6">
                {REPORTS.map(({ key, label }) => (
                  <TabsTrigger key={key} value={key} className="text-xs rounded-full">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {REPORTS.map(({ key, fetch }) => (
                <TabsContent key={key} value={key}>
                  <ReportPanel reportKey={key} fetch={fetch} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
