'use client';

import Link from 'next/link';
import { BookOpen, Building2, Key, Radio, Users } from 'lucide-react';
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
    description: 'Review vendor profiles and override KYC status directly from the table.',
    badge: 'GET /admin/vendors',
  },
  {
    href: '/admin/radio',
    icon: Radio,
    title: 'Radio Studio',
    description: 'Upload single tracks or batches of up to 10 audio files and view the live track library.',
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
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, vendors, radio content, ebook advances, and third-party integrations.
          </p>
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
