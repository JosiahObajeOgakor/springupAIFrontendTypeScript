'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

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

    // Mock login - verify against localStorage
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
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Create demo account and login
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="stickorder-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-primary">SpringUpAI</a>
          <a href="/vendor/signup" className="text-sm font-medium text-primary hover:opacity-90">Sign Up</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Access your jobs and earnings securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-secondary rounded-xl p-8 border border-border">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number or Email</label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 701 234 5678"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-base transition-all duration-200"
              />
            </div>

            {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold transition disabled:opacity-50 inline-flex items-center justify-center gap-2 min-h-11"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full px-6 py-3.5 border border-border text-foreground rounded-full font-semibold hover:bg-secondary/80 transition-all duration-200 min-h-11"
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
