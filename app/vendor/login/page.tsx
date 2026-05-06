'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import { vendorLogin, ApiError } from '@/lib/api';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/lib/store/authSlice';
import { Logo } from '@/components/logo';

export default function VendorLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    try {
      const res = await vendorLogin(phone.trim());
      dispatch(setCredentials({
        token: localStorage.getItem('token')!,
        vendorId: res.vendor_id,
        vendor: res.user,
      }));
      router.push('/vendor/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('No account found. Please sign up first.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background pattern */}
      <div className="absolute inset-0 gradient-hero pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <a href="/vendor/signup" className="text-sm font-medium text-primary hover:underline">Sign Up</a>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Access your jobs and earnings securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl p-8 border border-border shadow-float">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 701 234 5678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
              />
            </div>

            {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Don&apos;t have an account? <a href="/vendor/signup" className="text-primary font-medium hover:underline">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
