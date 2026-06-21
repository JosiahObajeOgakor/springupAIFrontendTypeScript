'use client';

import { useState } from 'react';
import { BanknoteIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { requestPayout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  vendorId?: string;
}

export function PayoutRequestCard({ vendorId: _vendorId }: Props) {
  const [form, setForm] = useState({
    amount_kobo: '',
    bank_code: '',
    account_number: '',
    account_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(form.amount_kobo, 10);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount.'); return; }
    setSubmitting(true);
    try {
      await requestPayout({
        amount_kobo: amount * 100, // ₦ → kobo
        bank_code: form.bank_code.trim(),
        account_number: form.account_number.trim(),
        account_name: form.account_name.trim(),
      });
      toast.success('Payout request submitted. Admin will review within 1 business day.');
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payout request failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="rounded-3xl shadow-float">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <CheckCircle2 size={40} className="text-green-500" />
          <p className="font-semibold">Payout request submitted</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Your request is queued for admin review. You will be notified once it is processed.
          </p>
          <Button variant="outline" className="rounded-full mt-2" onClick={() => { setDone(false); setForm({ amount_kobo: '', bank_code: '', account_number: '', account_name: '' }); }}>
            Request another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <BanknoteIcon size={16} className="text-primary" />
        </div>
        <CardTitle>Request payout</CardTitle>
        <CardDescription>
          Withdraw earnings to your bank account. Processed within 1 business day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="payout-amount">Amount (₦)</Label>
              <Input
                id="payout-amount"
                type="number"
                min="1"
                className="rounded-2xl"
                placeholder="e.g. 5000"
                {...field('amount_kobo')}
              />
              <p className="text-xs text-muted-foreground">Enter amount in Naira — converted to kobo automatically.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-bank-code">Bank code</Label>
              <Input id="payout-bank-code" className="rounded-2xl" placeholder="e.g. 044" {...field('bank_code')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-account">Account number</Label>
              <Input id="payout-account" className="rounded-2xl" placeholder="10-digit NUBAN" maxLength={10} {...field('account_number')} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="payout-name">Account name</Label>
              <Input id="payout-name" className="rounded-2xl" placeholder="As on the bank record" {...field('account_name')} />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <BanknoteIcon size={15} />}
            Submit payout request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
