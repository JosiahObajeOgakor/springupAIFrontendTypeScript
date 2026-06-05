'use client';

import { useState } from 'react';
import { Copy, Key, Loader2, ShieldOff, Sparkles } from 'lucide-react';
import { createEmbedKey, revokeEmbedKey } from '@/lib/api';
import type { EmbedKeyCreateResponse } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminEmbedKeysPage() {
  // Create key
  const [tenantName, setTenantName] = useState('');
  const [domain, setDomain] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdKey, setCreatedKey] = useState<EmbedKeyCreateResponse | null>(null);

  // Revoke key
  const [revokeKey, setRevokeKey] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreatedKey(null);
    try {
      const res = await createEmbedKey({
        tenant_name: tenantName.trim() || undefined,
        domain: domain.trim() || undefined,
      });
      setCreatedKey(res);
      toast.success('Embed key created successfully.');
      setTenantName('');
      setDomain('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create embed key.';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(e: React.FormEvent) {
    e.preventDefault();
    if (!revokeKey.trim()) { setRevokeError('Paste the embed key to revoke.'); return; }
    setRevoking(true);
    setRevokeError('');
    try {
      await revokeEmbedKey({ embed_key: revokeKey.trim() });
      toast.success('Embed key revoked.');
      setRevokeKey('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke key.';
      setRevokeError(msg);
      toast.error(msg);
    } finally {
      setRevoking(false);
    }
  }

  function copyKey(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard.');
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key size={18} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Embed Keys</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Issue and revoke API keys for third-party platform integrations. Keys gate access to the embed radio endpoints.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create key */}
          <Card className="rounded-3xl shadow-float">
            <CardHeader>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles size={16} className="text-primary" />
              </div>
              <CardTitle>Create embed key</CardTitle>
              <CardDescription>
                Issues a new API key via <code className="text-xs">POST /api/v1/admin/embed-key/create</code>. Copy and store it immediately — it will not be shown again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Tenant name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="tenant-name"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme.com"
                  />
                </div>

                {createError && (
                  <Alert variant="destructive">
                    <AlertTitle>Create failed</AlertTitle>
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="rounded-full w-full" disabled={creating}>
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate embed key
                </Button>
              </form>

              {createdKey && (
                <>
                  <Separator className="my-5" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">Key created</p>
                      <Badge variant="secondary">{createdKey.tenant_name}</Badge>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-secondary/60 border border-border px-4 py-3">
                      <code className="text-xs flex-1 break-all font-mono">{createdKey.embed_key}</code>
                      <button
                        type="button"
                        onClick={() => copyKey(createdKey.embed_key)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title="Copy key"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    {createdKey.usage && (
                      <p className="text-xs text-muted-foreground">{createdKey.usage}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Revoke key */}
          <Card className="rounded-3xl shadow-float">
            <CardHeader>
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                <ShieldOff size={16} className="text-destructive" />
              </div>
              <CardTitle>Revoke embed key</CardTitle>
              <CardDescription>
                Permanently invalidates an existing key via <code className="text-xs">POST /api/v1/admin/embed-key/revoke</code>. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRevoke} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revoke-key">Embed key to revoke</Label>
                  <Textarea
                    id="revoke-key"
                    value={revokeKey}
                    onChange={(e) => setRevokeKey(e.target.value)}
                    placeholder="Paste the full embed key..."
                    className="rounded-2xl font-mono text-xs resize-none min-h-[80px]"
                  />
                </div>

                {revokeError && (
                  <Alert variant="destructive">
                    <AlertTitle>Revoke failed</AlertTitle>
                    <AlertDescription>{revokeError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="destructive"
                  className="rounded-full w-full"
                  disabled={revoking || !revokeKey.trim()}
                >
                  {revoking ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                  Revoke key permanently
                </Button>
              </form>

              <Separator className="my-5" />
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-4 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Revocation is instant</p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Any third-party platform using this key will lose access immediately. Coordinate with the tenant before revoking.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
