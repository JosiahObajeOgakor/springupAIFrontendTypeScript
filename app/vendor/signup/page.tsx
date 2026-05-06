'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { registerVendorByPhone, ApiError } from '@/lib/api';

export default function VendorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
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

    if (!formData.fullName || !formData.phone || !formData.location || !formData.serviceCategory) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      await registerVendorByPhone({
        phone: formData.phone.trim(),
        name: formData.fullName.trim(),
        category: formData.serviceCategory,
        location: formData.location.trim(),
      });
      router.push('/vendor/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('A vendor with this phone already exists. Please sign in.');
      } else {
        setError('Signup failed. Please try again.');
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
          <a href="/" className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png" alt="SpringUpAI" className="h-16 w-auto" />
          </a>
          <a href="/vendor/login" className="text-sm font-medium text-primary hover:underline">Sign In</a>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Join SpringUpAI</h1>
              <p className="text-muted-foreground">Start receiving steady jobs in your area</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl p-8 border border-border shadow-float">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 701 234 5678"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ikeja, Lagos"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label htmlFor="serviceCategory" className="block text-sm font-medium mb-1.5">Service Category</label>
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                >
                  <option value="">Select a service</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="ac-repair">AC Repair</option>
                  <option value="appliance">Appliance Repair</option>
                </select>
              </div>

              {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
              >
                {loading ? 'Creating account...' : 'Start Receiving Jobs'} <ArrowRight size={18} />
              </button>

              <p className="text-sm text-muted-foreground text-center pt-1">
                Already have an account? <a href="/vendor/login" className="text-primary font-medium hover:underline">Sign In</a>
              </p>
            </form>
          </div>

          {/* Benefits Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-card rounded-2xl p-8 border border-border shadow-float">
              <h3 className="text-xl font-bold mb-6">Why join SpringUpAI?</h3>
              <div className="space-y-5">
                {[
                  { title: 'Steady Jobs', desc: 'Get consistent job requests in your area' },
                  { title: 'No Customer Hunting', desc: 'We bring customers directly to you' },
                  { title: 'Guaranteed Payment', desc: 'Payments secured until job completion' },
                  { title: 'No Negotiation', desc: 'Fair prices set — no back and forth' },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full gradient-primary border-2 border-card" />
                    ))}
                  </div>
                  <p>500+ vendors already earning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
