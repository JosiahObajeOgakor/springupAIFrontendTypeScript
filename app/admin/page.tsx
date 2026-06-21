'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpen, Building2, Key, Loader2, Radio, Users } from 'lucide-react';
import { getAdminDashboard } from '@/lib/api';
import { useAppSelector } from '@/lib/store/hooks';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SECTIONS = [
  {
    href: '/admin/users',
    icon: Users,
    title: 'Users',
    description: 'Browse and search all registered platform users with full pagination.',
    badge: 'GET /admin/users',
  },
  {
    href: '/admin/vendors',
    icon: Building2,
    title: 'Vendors',
    description: 'Review vendor profiles, KYC, suspend or approve directly from the table.',
    badge: 'GET /admin/vendors',
  },
  {
    href: '/admin/radio',
    icon: Radio,
    title: 'Radio Studio',
    description: 'Upload single tracks or batches, or use direct S3 presigned uploads.',
    badge: 'POST /radio/upload',
  },
  {
    href: '/admin/ebooks',
    icon: BookOpen,
    title: 'Ebook Advances',
    description: 'Approve or reject vendor advance requests with an optional rejection reason.',
    badge: 'POST /ebook/advance/review',
  },
  {
    href: '/admin/embed-keys',
    icon: Key,
    title: 'Embed Keys',
    description: 'Issue API keys for third-party platform integrations and revoke them instantly.',
    badge: 'POST /admin/embed-key',
  },
  {
    href: '/admin/reports',
    icon: BarChart3,
    title: 'Reports',
    description: 'Revenue, escrow, KYC, commissions, engagement and more — all 11 live reports.',
    badge: 'GET /admin/reports/*',
  },
];

export default function AdminDashboardPage() {
  const token = useAppSelector((s) => s.auth.token);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Only fire once the Redux store has a token (avoids 401 during rehydration).
  useEffect(() => {
    if (!token) return;
    getAdminDashboard()
      .then((d) => setStats(d as Record<string, unknown>))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, [token]);

  // Pull out any numeric stat values from the dashboard response for display.
  const statEntries = stats
    ? Object.entries(stats).filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    : [];

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, vendors, radio content, ebook advances, and third-party integrations.
          </p>
        </div>

        {/* Live stats */}
        <div>
          {loadingStats ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading live stats…
            </div>
          ) : statEntries.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              {statEntries.map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-border bg-card px-4 py-3 shadow-float">
                  <p className="text-2xl font-bold tabular-nums">{String(value)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map(({ href, icon: Icon, title, description, badge }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full rounded-3xl shadow-float transition-shadow hover:shadow-elevated border-border group-hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="font-mono text-xs">{badge}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
