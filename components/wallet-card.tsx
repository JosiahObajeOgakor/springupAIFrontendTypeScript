'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { fundWallet, createVirtualAccount, internalTransfer } from '@/lib/api';
import type { WalletFundResponse } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Props {
  ownerId: string;
}

export function WalletCard({ ownerId }: Props) {
  const [virtualAccount, setVirtualAccount] = useState<{ account_number?: string; bank_name?: string; account_name?: string } | null>(null);
  const [loadingVA, setLoadingVA] = useState(false);

  // Fund via Paystack redirect
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [fundResult, setFundResult] = useState<WalletFundResponse | null>(null);

  // Internal transfer
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);

  async function handleCreateVA() {
    setLoadingVA(true);
    try {
      const res = await createVirtualAccount({} as never);
      setVirtualAccount(res as typeof virtualAccount);
      toast.success('Virtual account created.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create virtual account.');
    } finally {
      setLoadingVA(false);
    }
  }

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(fundAmount, 10);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount.'); return; }
    setFunding(true);
    try {
      const res = await fundWallet({ owner_id: ownerId, amount: amount * 100 }); // ₦ → kobo
      setFundResult(res);
      if (res.authorization_url) {
        window.open(res.authorization_url, '_blank', 'noopener');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Funding failed.');
    } finally {
      setFunding(false);
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(transferAmount, 10);
    if (!amount || !transferTo.trim()) { toast.error('Recipient ID and amount are required.'); return; }
    setTransferring(true);
    try {
      await internalTransfer({
        recipient_id: transferTo.trim(),
        amount_kobo: amount * 100,
        note: transferNote.trim() || undefined,
      });
      toast.success('Transfer sent.');
      setTransferTo(''); setTransferAmount(''); setTransferNote('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed.');
    } finally {
      setTransferring(false);
    }
  }

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Wallet size={16} className="text-primary" />
        </div>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>Fund your wallet, create a virtual account, or send to another user.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fund">
          <TabsList className="mb-4">
            <TabsTrigger value="fund">Fund</TabsTrigger>
            <TabsTrigger value="virtual">Virtual account</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="fund">
            <form onSubmit={handleFund} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fund-amount">Amount (₦)</Label>
                <Input
                  id="fund-amount"
                  type="number"
                  min="1"
                  className="rounded-2xl"
                  placeholder="e.g. 2000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
              </div>
              {fundResult?.authorization_url && (
                <div className="rounded-2xl bg-secondary/40 p-3 text-sm space-y-1">
                  <p className="text-muted-foreground text-xs">Payment page opened. Complete payment there.</p>
                  <p className="font-mono text-xs">Ref: {fundResult.reference}</p>
                </div>
              )}
              <Button type="submit" className="w-full rounded-full" disabled={funding}>
                {funding ? <Loader2 size={15} className="animate-spin" /> : null}
                Pay via Paystack
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="virtual">
            <div className="space-y-4">
              {virtualAccount?.account_number ? (
                <div className="rounded-2xl bg-secondary/40 p-4 space-y-2">
                  <p className="text-sm font-semibold">{virtualAccount.bank_name}</p>
                  <Badge variant="outline" className="font-mono text-base px-4 py-1.5">{virtualAccount.account_number}</Badge>
                  <p className="text-xs text-muted-foreground">{virtualAccount.account_name}</p>
                  <p className="text-xs text-muted-foreground">Transfer any amount to this account to fund your wallet automatically.</p>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-muted-foreground">No virtual account yet. Create one to receive bank transfers directly to your wallet.</p>
                  <Button className="rounded-full" onClick={handleCreateVA} disabled={loadingVA}>
                    {loadingVA ? <Loader2 size={15} className="animate-spin" /> : null}
                    Create virtual account
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfer">
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="transfer-to">Recipient user ID</Label>
                <Input id="transfer-to" className="rounded-2xl" placeholder="User ID on SpringUpAI" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transfer-amount">Amount (₦)</Label>
                <Input id="transfer-amount" type="number" min="1" className="rounded-2xl" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transfer-note">Note (optional)</Label>
                <Input id="transfer-note" className="rounded-2xl" placeholder="What this is for" value={transferNote} onChange={(e) => setTransferNote(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={transferring}>
                {transferring ? <Loader2 size={15} className="animate-spin" /> : null}
                Send transfer
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
