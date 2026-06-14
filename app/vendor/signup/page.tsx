'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle, Zap, Gift } from 'lucide-react';
import { registerVendor, ApiError } from '@/lib/api';
import { Logo } from '@/components/logo';

export default function VendorSignup() {
  return (
    <Suspense>
      <VendorSignupContent />
    </Suspense>
  );
}

function VendorSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
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
      await registerVendor({
        phone: formData.phone.trim(),
        name: formData.fullName.trim(),
        category: formData.serviceCategory,
        location: formData.location.trim(),
        ...(referralCode ? { referral_code: referralCode } : {}),
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
          <Logo />
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

            {referralCode && (
              <div className="mb-6 rounded-2xl p-4 border border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800 flex items-start gap-3">
                <Gift size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-green-800 dark:text-green-200">You were referred!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                    Sign up and earn ₦500 bonus when you complete your first bill payment or booking.
                  </p>
                </div>
              </div>
            )}

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
                  <optgroup label="Home Services">
                    <option value="Cleaning">Cleaning</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Painting">Painting</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Fumigation">Fumigation / Pest Control</option>
                    <option value="Air Conditioning">Air Conditioning Repair</option>
                    <option value="Generator Repair">Generator Repair</option>
                    <option value="Tiling">Tiling</option>
                    <option value="Home Security">Home Security Installation</option>
                  </optgroup>
                  <optgroup label="Beauty &amp; Personal Care">
                    <option value="Haircut">Haircut / Barbing</option>
                    <option value="Braiding">Hair Braiding / Styling</option>
                    <option value="Makeup">Makeup Artist</option>
                    <option value="Manicure & Pedicure">Manicure &amp; Pedicure</option>
                    <option value="Massage">Massage Therapy</option>
                    <option value="Skincare">Skincare / Facial</option>
                  </optgroup>
                  <optgroup label="Logistics &amp; Transport">
                    <option value="Dispatch">Dispatch / Delivery</option>
                    <option value="Moving">House Moving / Relocation</option>
                    <option value="Ride">Ride / Chauffeur</option>
                    <option value="Errand">Errand Running</option>
                  </optgroup>
                  <optgroup label="Tech &amp; Digital">
                    <option value="Phone Repair">Phone / Gadget Repair</option>
                    <option value="Laptop Repair">Laptop Repair</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Web Design">Web Design</option>
                    <option value="Social Media">Social Media Management</option>
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                  </optgroup>
                  <optgroup label="Education &amp; Training">
                    <option value="Tutoring">Private Tutoring</option>
                    <option value="Driving Lessons">Driving Lessons</option>
                    <option value="Fitness Training">Fitness / Personal Training</option>
                    <option value="Cooking Classes">Cooking Classes</option>
                  </optgroup>
                  <optgroup label="Food &amp; Catering">
                    <option value="Catering">Catering / Events Food</option>
                    <option value="Meal Prep">Meal Prep / Delivery</option>
                    <option value="Baking">Baking / Pastry</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="Laundry">Laundry / Dry Cleaning</option>
                    <option value="Tailoring">Tailoring / Fashion</option>
                    <option value="Event Planning">Event Planning</option>
                    <option value="Security">Security Guard</option>
                    <option value="Other">Other</option>
                  </optgroup>
                </select>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Start Receiving Jobs <ArrowRight size={18} />
                  </>
                )}
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
