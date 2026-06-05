'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { listVendors, overrideKyc } from '@/lib/api';
import type { Vendor } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const KYC_STATUSES = ['pending', 'submitted', 'approved', 'rejected', 'verified'];

function kycBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved' || status === 'verified') return 'default';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [overrideTarget, setOverrideTarget] = useState<Vendor | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [overriding, setOverriding] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchVendors = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await listVendors(p, PAGE_SIZE);
      setVendors(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVendors(page);
  }, [fetchVendors, page]);

  function openOverride(vendor: Vendor) {
    setOverrideTarget(vendor);
    setNewStatus(vendor.kyc_status ?? 'pending');
  }

  async function confirmOverride() {
    if (!overrideTarget || !newStatus) return;
    setOverriding(true);
    try {
      await overrideKyc({ vendor_id: overrideTarget.id, kyc_status: newStatus });
      toast.success(`KYC status updated to "${newStatus}" for ${overrideTarget.name}.`);
      setOverrideTarget(null);
      void fetchVendors(page);
    } catch {
      toast.error('KYC override failed. Please try again.');
    } finally {
      setOverriding(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={18} className="text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              All registered vendors — <span className="font-medium text-foreground">{total.toLocaleString()}</span> total
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => void fetchVendors(page)}
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
                    <TableHead className="pl-6 w-[220px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j} className={j === 0 ? 'pl-6' : j === 6 ? 'pr-6' : ''}>
                              <Skeleton className="h-4 w-full rounded-md" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : vendors.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                            No vendors found on this page.
                          </TableCell>
                        </TableRow>
                      )
                    : vendors.map((vendor) => (
                        <TableRow key={vendor.id} className="hover:bg-secondary/30">
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                            {vendor.id}
                          </TableCell>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{vendor.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {vendor.location || '—'}
                          </TableCell>
                          <TableCell>
                            {vendor.verified ? (
                              <Badge className="text-xs gap-1"><ShieldCheck size={10} /> Verified</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Unverified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={kycBadgeVariant(vendor.kyc_status)} className="text-xs capitalize">
                              {vendor.kyc_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs h-7"
                              onClick={() => openOverride(vendor)}
                            >
                              Override KYC
                            </Button>
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
            Showing {vendors.length} of {total.toLocaleString()} vendors
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
            <span className="text-sm tabular-nums px-2">{page} / {totalPages}</span>
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

      {/* KYC Override Dialog */}
      <Dialog open={!!overrideTarget} onOpenChange={(open) => { if (!open) setOverrideTarget(null); }}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Override KYC status</DialogTitle>
            <DialogDescription>
              Change KYC status for <span className="font-semibold text-foreground">{overrideTarget?.name}</span>.
              This is irreversible through normal vendor flows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Current status</Label>
              <Badge variant={kycBadgeVariant(overrideTarget?.kyc_status ?? '')} className="capitalize">
                {overrideTarget?.kyc_status}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kyc-status-select">New status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="kyc-status-select" className="rounded-2xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {KYC_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setOverrideTarget(null)} disabled={overriding}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={confirmOverride} disabled={overriding || newStatus === overrideTarget?.kyc_status}>
              {overriding ? <Loader2 size={14} className="animate-spin" /> : null}
              Confirm override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
