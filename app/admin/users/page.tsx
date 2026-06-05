'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Users } from 'lucide-react';
import { listUsers } from '@/lib/api';
import type { User } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await listUsers(p, PAGE_SIZE);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers(page);
  }, [fetchUsers, page]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={18} className="text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              All registered platform users — <span className="font-medium text-foreground">{total.toLocaleString()}</span> total
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => void fetchUsers(page)}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </Button>
        </div>

        <Card className="rounded-3xl shadow-float overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">
              Page {page} of {totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-[260px]">ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead className="pr-6">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <TableCell key={j} className={j === 0 ? 'pl-6' : j === 4 ? 'pr-6' : ''}>
                              <Skeleton className="h-4 w-full rounded-md" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : users.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-16 text-sm">
                            No users found on this page.
                          </TableCell>
                        </TableRow>
                      )
                    : users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-secondary/30">
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                            {user.id}
                          </TableCell>
                          <TableCell className="font-medium">{user.phone}</TableCell>
                          <TableCell>{user.name || <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            {user.language ? (
                              <Badge variant="secondary" className="text-xs">{user.language}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-6 text-sm text-muted-foreground">
                            {user.location || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {total.toLocaleString()} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </Button>
            <span className="text-sm tabular-nums px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
