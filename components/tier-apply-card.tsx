'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { applyForTier } from '@/lib/api';
import type { TierApplyPayload, TierApplyResponse, VendorTierLevel } from '@/lib/api';
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
import { toast } from 'sonner';

const TIERS: { value: VendorTierLevel; label: string; cap: string }[] = [
  { value: 'gold',     label: 'Gold',     cap: 'Up to 3 listings' },
  { value: 'silver',   label: 'Silver',   cap: 'Up to 5 listings' },
  { value: 'platinum', label: 'Platinum', cap: 'Unlimited listings' },
];

interface Props {
  vendorId: string;
  vendorEmail?: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        access_code?: string;
        onSuccess: (transaction: { reference: string }) => void;
        onCancel: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export function TierApplyCard({ vendorId, vendorEmail = '' }: Props) {
  const [tier, setTier] = useState<VendorTierLevel>('gold');

  // Dynamically load the Paystack Inline JS so PaystackPop is available before payment.
  useEffect(() => {
    if (document.getElementById('paystack-inline-js')) return;
    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
  const [email, setEmail] = useState(vendorEmail);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<TierApplyResponse | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { toast.error('Email is required for payment.'); return; }
    setLoading(true);
    try {
      const payload: TierApplyPayload = {
        vendor_id: vendorId,
        tier_level: tier,
        email: email.trim(),
        callback_url: typeof window !== 'undefined' ? window.location.href : undefined,
      };
      const res = await applyForTier(payload);
      setResult(res);

      // Try Paystack Inline first (keeps user on page)
      if (window.PaystackPop && res.paystack_public_key && res.access_code) {
        const handler = window.PaystackPop.setup({
          key: res.paystack_public_key,
          email: email.trim(),
          amount: res.amount,
          currency: res.currency,
          access_code: res.access_code,
          ref: res.provider_reference,
          onSuccess: () => {
            toast.success('Payment complete! Your tier will activate shortly via webhook.');
            setDone(true);
          },
          onCancel: () => {
            toast.info('Payment cancelled. You can retry anytime.');
          },
        });
        handler.openIframe();
      } else if (res.authorization_url) {
        // Fallback: redirect to Paystack hosted checkout
        window.location.href = res.authorization_url;
      } else {
        toast.success('Tier application submitted.');
        setDone(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to initialise payment.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card className="rounded-3xl shadow-float">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <CheckCircle2 size={40} className="text-green-500" />
          <p className="font-semibold text-lg">Tier application submitted</p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Your tier will activate automatically once the Paystack webhook confirms payment (usually within seconds).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <CreditCard size={16} className="text-primary" />
        </div>
        <CardTitle>Upgrade your tier</CardTitle>
        <CardDescription>
          A verified KYC is required. Payment is handled by Paystack Inline — you stay on this page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleApply} className="space-y-5">
          <div className="space-y-2">
            <Label>Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as VendorTierLevel)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {TIERS.map(({ value, label, cap }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <span>{label}</span>
                      <Badge variant="secondary" className="text-xs">{cap}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-email">Email for receipt</Label>
            <Input
              id="tier-email"
              type="email"
              className="rounded-2xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {result && (
            <div className="rounded-2xl bg-secondary/40 p-3 text-xs space-y-1 text-muted-foreground">
              <p>Amount: <span className="font-semibold text-foreground">₦{(result.amount / 100).toLocaleString()}</span></p>
              <p>Reference: <span className="font-mono">{result.provider_reference}</span></p>
            </div>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
            Pay &amp; Upgrade
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
