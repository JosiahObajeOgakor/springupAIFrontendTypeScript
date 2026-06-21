'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Loader2, RefreshCw, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react';
import { listVendors, overrideKyc, suspendVendor, unsuspendVendor, approveVendor } from '@/lib/api';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const KYC_STATUSES = ['pending', 'submitted', 'approved', 'rejected', 'verified'];

function kycBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved' || status === 'verified') return 'default';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

type ActionDialog =
  | { type: 'kyc'; vendor: Vendor }
  | { type: 'suspend'; vendor: Vendor }
  | { type: 'unsuspend'; vendor: Vendor }
  | { type: 'approve'; vendor: Vendor }
  | null;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [newKycStatus, setNewKycStatus] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  function openDialog(type: ActionDialog) {
    setReason('');
    if (type?.type === 'kyc') setNewKycStatus(type.vendor.kyc_status ?? 'pending');
    setDialog(type);
  }

  async function handleConfirm() {
    if (!dialog) return;
    setSubmitting(true);
    try {
      if (dialog.type === 'kyc') {
        await overrideKyc({ vendor_id: dialog.vendor.id, kyc_status: newKycStatus });
        toast.success(`KYC updated to "${newKycStatus}" for ${dialog.vendor.name}.`);
      } else if (dialog.type === 'suspend') {
        if (!reason.trim()) { toast.error('A reason is required to suspend.'); setSubmitting(false); return; }
        await suspendVendor({ vendor_id: dialog.vendor.id, reason: reason.trim() });
        toast.success(`${dialog.vendor.name} suspended.`);
      } else if (dialog.type === 'unsuspend') {
        await unsuspendVendor({ vendor_id: dialog.vendor.id });
        toast.success(`${dialog.vendor.name} unsuspended.`);
      } else if (dialog.type === 'approve') {
        await approveVendor({ vendor_id: dialog.vendor.id, approved: true, reason: reason.trim() || undefined });
        toast.success(`${dialog.vendor.name} approved.`);
      }
      setDialog(null);
      void fetchVendors(page);
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setSubmitting(false);
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
                    <TableHead className="pl-6 w-40">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <TableCell key={j} className={j === 0 ? 'pl-6' : j === 5 ? 'pr-6' : ''}>
                              <Skeleton className="h-4 w-full rounded-md" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : vendors.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-16 text-sm">
                            No vendors found on this page.
                          </TableCell>
                        </TableRow>
                      )
                    : vendors.map((vendor) => (
                        <TableRow key={vendor.id} className="hover:bg-secondary/30">
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                            {vendor.id.slice(0, 12)}…
                          </TableCell>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{vendor.category}</Badge>
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
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button
                                variant="outline" size="sm" className="rounded-full text-xs h-7"
                                onClick={() => openDialog({ type: 'kyc', vendor })}
                              >
                                KYC
                              </Button>
                              <Button
                                variant="outline" size="sm"
                                className="rounded-full text-xs h-7 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => openDialog({ type: 'approve', vendor })}
                              >
                                <UserCheck size={11} /> Approve
                              </Button>
                              <Button
                                variant="outline" size="sm"
                                className="rounded-full text-xs h-7 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => openDialog({ type: 'suspend', vendor })}
                              >
                                <ShieldOff size={11} /> Suspend
                              </Button>
                              <Button
                                variant="outline" size="sm"
                                className="rounded-full text-xs h-7 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => openDialog({ type: 'unsuspend', vendor })}
                              >
                                <UserX size={11} /> Unsuspend
                              </Button>
                            </div>
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
            <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} /> Previous
            </Button>
            <span className="text-sm tabular-nums px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!dialog} onOpenChange={(open) => { if (!open) setDialog(null); }}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === 'kyc' && 'Override KYC status'}
              {dialog?.type === 'suspend' && 'Suspend vendor'}
              {dialog?.type === 'unsuspend' && 'Unsuspend vendor'}
              {dialog?.type === 'approve' && 'Approve vendor'}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === 'kyc' && (
                <>Change KYC for <span className="font-semibold text-foreground">{dialog.vendor.name}</span>. This bypasses the normal verification flow.</>
              )}
              {dialog?.type === 'suspend' && (
                <>Suspend <span className="font-semibold text-foreground">{dialog.vendor.name}</span>. They will lose access until unsuspended.</>
              )}
              {dialog?.type === 'unsuspend' && (
                <>Restore access for <span className="font-semibold text-foreground">{dialog.vendor.name}</span>.</>
              )}
              {dialog?.type === 'approve' && (
                <>Approve <span className="font-semibold text-foreground">{dialog.vendor.name}</span> as a verified vendor.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {dialog?.type === 'kyc' && (
              <div className="space-y-1.5">
                <Label htmlFor="kyc-status-select">New KYC status</Label>
                <Select value={newKycStatus} onValueChange={setNewKycStatus}>
                  <SelectTrigger id="kyc-status-select" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {KYC_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(dialog?.type === 'suspend' || dialog?.type === 'approve') && (
              <div className="space-y-1.5">
                <Label htmlFor="action-reason">
                  Reason {dialog.type === 'suspend' ? '(required)' : '(optional)'}
                </Label>
                <Textarea
                  id="action-reason"
                  className="rounded-2xl resize-none"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={dialog.type === 'suspend' ? 'State the reason for suspension' : 'Optional approval note'}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setDialog(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={handleConfirm}
              disabled={submitting || (dialog?.type === 'kyc' && newKycStatus === dialog.vendor.kyc_status)}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
