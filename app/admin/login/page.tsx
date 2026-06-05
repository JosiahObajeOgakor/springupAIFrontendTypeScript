'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { adminLogin, ApiError } from '@/lib/api';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!phone.trim() || !secret.trim()) {
      setError('Phone and secret are required.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({
        phone: phone.trim(),
        secret: secret.trim(),
      });
      router.push('/admin');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid admin credentials.');
      } else {
        setError('Admin login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <Link href="/" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-md mx-auto">
          <Card className="rounded-3xl shadow-float overflow-hidden">
            <CardHeader className="gradient-primary text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                <Shield size={22} className="text-white" />
              </div>
              <CardTitle className="text-2xl">Admin access</CardTitle>
              <CardDescription className="text-white/75">
                Sign in with your admin phone and secret to access the SpringUpAI admin console.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Phone number</Label>
                  <Input
                    id="admin-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0801 234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-secret">Admin secret</Label>
                  <Input
                    id="admin-secret"
                    type="password"
                    value={secret}
                    onChange={(event) => setSecret(event.target.value)}
                    placeholder="Enter admin secret"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Login failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Enter admin console'}
                  {!loading && <ArrowRight size={16} />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}