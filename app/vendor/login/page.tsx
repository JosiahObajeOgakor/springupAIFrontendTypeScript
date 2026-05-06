'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';

export default function VendorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.phone || !formData.password) {
      setError('Phone and password are required');
      setLoading(false);
      return;
    }

    try {
      const vendor = localStorage.getItem('vendor');
      if (vendor) {
        const vendorData = JSON.parse(vendor);
        if (vendorData.phone === formData.phone && vendorData.password === formData.password) {
          localStorage.setItem('vendorToken', 'token_' + Date.now());
          router.push('/vendor/dashboard');
        } else {
          setError('Invalid phone or password');
          setLoading(false);
        }
      } else {
        setError('No account found. Please sign up first.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoVendor = {
      id: '1234567890',
      fullName: 'Chukwu Adeyemi',
      phone: '+234 701 234 5678',
      password: 'demo123',
      location: 'Lagos',
      serviceCategory: 'Plumbing'
    };
    localStorage.setItem('vendor', JSON.stringify(demoVendor));
    localStorage.setItem('vendorToken', 'token_' + Date.now());
    router.push('/vendor/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background pattern */}
      <div className="absolute inset-0 gradient-hero pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gradient">SpringUpAI</a>
          <a href="/vendor/signup" className="text-sm font-medium text-primary hover:underline">Sign Up</a>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Access your jobs and earnings securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl p-8 border border-border shadow-float">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone Number or Email</label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 701 234 5678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
              />
            </div>

            {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full px-6 py-3.5 border border-border text-foreground rounded-full font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2"
            >
              Try Demo
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
