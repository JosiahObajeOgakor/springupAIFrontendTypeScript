'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, CheckCircle, Clock, DollarSign, Wallet } from 'lucide-react';

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    const vendorData = localStorage.getItem('vendor');

    if (!token || !vendorData) {
      router.push('/vendor/login');
      return;
    }

    setVendor(JSON.parse(vendorData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendor');
    router.push('/vendor/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const mockEarnings = {
    totalEarnings: 450000,
    pendingPayments: 75000,
    completedPayouts: 375000,
  };

  const mockJobs = [
    { id: 1, title: 'Fix leaking pipe', location: 'Ikeja, Lagos', price: 15000, status: 'pending' },
    { id: 2, title: 'Electrical fault repair', location: 'Victoria Island', price: 12000, status: 'accepted' },
    { id: 3, title: 'AC servicing', location: 'Lekki', price: 25000, status: 'completed' },
  ];

  const mockServices = [
    { id: 1, name: 'Plumbing Repair', priceRange: '₦10,000 - ₦50,000', active: true },
    { id: 2, name: 'Pipe Installation', priceRange: '₦15,000 - ₦80,000', active: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-primary">SpringUpAI</a>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">{vendor?.fullName}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition inline-flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {vendor?.fullName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Service: {vendor?.serviceCategory}</p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₦${(mockEarnings.totalEarnings).toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
            { label: 'Pending', value: `₦${(mockEarnings.pendingPayments).toLocaleString()}`, icon: Clock, color: 'text-yellow-600' },
            { label: 'Paid Out', value: `₦${(mockEarnings.completedPayouts).toLocaleString()}`, icon: CheckCircle, color: 'text-green-600' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* How You Get Paid */}
        <div className="bg-secondary rounded-xl p-6 border border-border mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-primary" /> How You Get Paid
          </h3>
          <div className="space-y-3 text-sm">
            {[
              '1. Complete a job',
              '2. Customer confirms completion',
              '3. Payment is released automatically',
              '4. Withdraw anytime to your bank account',
            ].map((step) => (
              <p key={step} className="text-muted-foreground">
                <span className="font-medium text-foreground">{step}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          {['overview', 'jobs', 'wallet', 'services'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Available & Active Jobs</h3>
            {mockJobs.map((job) => (
              <div key={job.id} className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">₦{job.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    {job.status === 'pending' && <button className="px-4 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90">Accept</button>}
                    {job.status === 'accepted' && <button className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:opacity-90">Mark Done</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="max-w-md">
            <div className="bg-secondary rounded-xl p-6 border border-border mb-4">
              <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold mb-4">₦{(mockEarnings.pendingPayments).toLocaleString()}</p>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition">
                Withdraw to Bank
              </button>
            </div>
            <div className="bg-secondary rounded-xl p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Pending</p>
              <p className="text-2xl font-bold">₦{(mockEarnings.completedPayouts).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {mockServices.map((service) => (
              <div key={service.id} className="bg-secondary rounded-xl p-6 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.priceRange}</p>
                </div>
                <input type="checkbox" checked={service.active} className="w-5 h-5 rounded" readOnly />
              </div>
            ))}
            <button className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2">
              <Plus size={18} /> Add New Service
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Why vendors use SpringUpAI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'No customer hunting', desc: 'Get matched with real paying jobs' },
                  { title: 'Steady income', desc: 'Consistent job requests in your area' },
                  { title: 'Guaranteed payment', desc: 'Payment released after completion' },
                  { title: 'We handle comms', desc: 'Focus on work, not finding clients' },
                ].map((reason) => (
                  <div key={reason.title} className="bg-secondary rounded-lg p-4 border border-border">
                    <p className="font-semibold text-sm mb-1">{reason.title}</p>
                    <p className="text-xs text-muted-foreground">{reason.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
