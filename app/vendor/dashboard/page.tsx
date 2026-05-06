'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, CheckCircle, Clock, DollarSign, Wallet, Zap, AlertTriangle } from 'lucide-react';
import { getVendorServices, checkPlan, getKycStatus } from '@/lib/api';
import type { VendorService, PlanCheckResponse, KycStatusResponse } from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { clearAuth } from '@/lib/store/authSlice';
import { ProtectedRoute } from '@/components/protected-route';
import { Logo } from '@/components/logo';

export default function VendorDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { vendor: reduxVendor, vendorId } = useAppSelector((state) => state.auth);
  const [vendor, setVendor] = useState<any>(reduxVendor);
  const [services, setServices] = useState<VendorService[]>([]);
  const [plan, setPlan] = useState<PlanCheckResponse | null>(null);
  const [kyc, setKyc] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!vendorId) return;

    async function fetchData() {
      try {
        const [svc, planData, kycData] = await Promise.all([
          getVendorServices(vendorId!),
          checkPlan(vendorId!).catch(() => null),
          getKycStatus(vendorId!).catch(() => null),
        ]);
        setServices(svc || []);
        setPlan(planData);
        setKyc(kycData);
      } catch {
        dispatch(clearAuth());
        router.push('/vendor/login');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vendorId, dispatch, router]);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push('/vendor/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <Zap size={20} className="text-white" />
        </div>
      </div>
    );
  }

  const mockJobs = [
    { id: 1, title: 'Fix leaking pipe', location: 'Ikeja, Lagos', price: 15000, status: 'pending' },
    { id: 2, title: 'Electrical fault repair', location: 'Victoria Island', price: 12000, status: 'accepted' },
    { id: 3, title: 'AC servicing', location: 'Lekki', price: 25000, status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium hidden sm:block">{vendor?.name || vendor?.fullName}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition inline-flex items-center gap-2"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* KYC Banner */}
        {kyc && kyc.status !== 'approved' && (
          <div className="mb-6 rounded-2xl p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">
                {kyc.status === 'rejected' ? 'KYC Rejected' : 'KYC Verification Required'}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                {kyc.status === 'rejected'
                  ? kyc.reason || 'Your KYC submission was rejected. Please re-submit.'
                  : 'Complete your KYC verification to create services and receive payments.'}
              </p>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome, {(vendor?.name || vendor?.fullName)?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm">
            {vendor?.category || vendor?.serviceCategory}
            {plan?.active && <span className="ml-2 text-primary font-medium">• {plan.plan}</span>}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Services Listed', value: `${services?.length ?? 0}`, icon: DollarSign, gradient: true },
            { label: 'Plan Status', value: plan?.active ? plan.plan : 'No Plan', icon: Clock, gradient: false },
            { label: 'KYC', value: kyc?.status || vendor?.kyc_status || 'Pending', icon: CheckCircle, gradient: false },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-2xl p-6 border border-border shadow-elevated ${card.gradient ? 'gradient-primary text-white' : 'bg-card'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs mb-1 ${card.gradient ? 'text-white/70' : 'text-muted-foreground'}`}>{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.gradient ? 'bg-white/20' : 'bg-primary/5'}`}>
                    <Icon size={18} className={card.gradient ? 'text-white' : 'text-primary'} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How You Get Paid */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-primary" /> How You Get Paid
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: '1', text: 'Complete a job' },
              { step: '2', text: 'Customer confirms' },
              { step: '3', text: 'Payment released' },
              { step: '4', text: 'Withdraw anytime' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-2 sm:flex-col sm:text-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{item.step}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-full w-fit">
          {['overview', 'jobs', 'wallet', 'services'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize rounded-full transition-all ${
                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
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
              <div key={job.id} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
                    {job.status === 'pending' && <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-transform">Accept</button>}
                    {job.status === 'accepted' && <button className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-transform">Mark Done</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="max-w-md">
            <div className="gradient-primary rounded-2xl p-6 text-white shadow-elevated mb-4">
              <p className="text-xs text-white/70 mb-1">Wallet</p>
              <p className="text-3xl font-bold mb-5">Coming Soon</p>
              <button className="w-full px-4 py-3 bg-white text-primary rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Withdraw to Bank
              </button>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Plan Status</p>
              <p className="text-2xl font-bold">{plan?.active ? `${plan.plan} (Active)` : 'No active plan'}</p>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {services.length === 0 && (
              <p className="text-sm text-muted-foreground">No services yet. Add your first service below.</p>
            )}
            {services.map((service) => (
              <div key={service.id} className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between hover:shadow-elevated transition-shadow">
                <div>
                  <h4 className="font-semibold">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">₦{service.price.toLocaleString()}</p>
                </div>
                <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${service.available ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${service.available ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
            <button className="w-full px-4 py-3.5 border-2 border-dashed border-border text-muted-foreground rounded-2xl font-medium hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2">
              <Plus size={18} /> Add New Service
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-semibold mb-4">Why vendors use SpringUpAI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'No customer hunting', desc: 'Get matched with real paying jobs' },
                { title: 'Steady income', desc: 'Consistent job requests in your area' },
                { title: 'Guaranteed payment', desc: 'Payment released after completion' },
                { title: 'We handle comms', desc: 'Focus on work, not finding clients' },
              ].map((reason) => (
                <div key={reason.title} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-elevated transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center mb-3">
                    <CheckCircle size={16} className="text-primary" />
                  </div>
                  <p className="font-semibold text-sm mb-1">{reason.title}</p>
                  <p className="text-sm text-muted-foreground">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
