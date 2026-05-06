'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function VendorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    location: '',
    serviceCategory: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.fullName || !formData.phone || !formData.password || !formData.location || !formData.serviceCategory) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Mock signup - store in localStorage
    try {
      const vendor = {
        id: Date.now().toString(),
        ...formData,
      };
      localStorage.setItem('vendor', JSON.stringify(vendor));
      localStorage.setItem('vendorToken', 'token_' + Date.now());
      router.push('/vendor/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-primary">SpringUpAI</a>
          <a href="/vendor/login" className="text-sm font-medium text-primary hover:opacity-90">Sign In</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Join SpringUpAI</h1>
              <p className="text-muted-foreground">Start receiving steady jobs in your area</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ikeja, Lagos"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Service Category</label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a service</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="ac-repair">AC Repair</option>
                  <option value="appliance">Appliance Repair</option>
                </select>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? 'Creating account...' : 'Start Receiving Jobs'} <ArrowRight size={18} />
              </button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <a href="/vendor/login" className="text-primary font-medium hover:underline">Sign In</a>
              </p>
            </form>
          </div>

          {/* Benefits Panel */}
          <div className="bg-secondary rounded-xl p-8 border border-border h-fit">
            <h3 className="text-xl font-bold mb-6">Why join SpringUpAI?</h3>
            <div className="space-y-4">
              {[
                { title: 'Steady Jobs', desc: 'Get consistent job requests in your area' },
                { title: 'No Customer Hunting', desc: 'No need to find customers yourself' },
                { title: 'Guaranteed Payment', desc: 'Payments are guaranteed after job completion' },
                { title: 'No Negotiation', desc: 'Prices are handled for you—no stress' },
              ].map((benefit) => (
                <div key={benefit.title} className="pb-4 border-b border-border last:border-b-0">
                  <p className="font-semibold text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
