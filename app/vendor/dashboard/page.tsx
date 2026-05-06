'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, CheckCircle, Clock, DollarSign, Wallet, Zap, AlertTriangle, Upload, FileText } from 'lucide-react';
import { getVendorServices, checkPlan, getKycStatus, getKycPresignUrl, submitKyc } from '@/lib/api';
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

  // KYC form state
  const [kycForm, setKycForm] = useState({ fullName: '', bvn: '', documentType: 'national_id' });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);
  const [kycError, setKycError] = useState('');

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

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFile || !kycForm.fullName || !kycForm.bvn) {
      setKycError('All fields are required');
      return;
    }
    setKycError('');
    setKycSubmitting(true);
    try {
      const presign = await getKycPresignUrl({
        filename: kycFile.name,
        content_type: kycFile.type,
      });
      await fetch(presign.upload_url, {
        method: 'PUT',
        body: kycFile,
        headers: { 'Content-Type': kycFile.type },
      });
      await submitKyc({
        document_key: presign.key,
        document_type: kycForm.documentType,
        full_name: kycForm.fullName,
        bvn: kycForm.bvn,
      });
      setKycSuccess(true);
      setKyc({ status: 'pending' });
    } catch {
      setKycError('KYC submission failed. Please try again.');
    } finally {
      setKycSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img
          src="https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png"
          alt="SpringUpAI"
          className="h-16 w-auto animate-pulse"
        />
        <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo className="h-10 sm:h-16 w-auto" />
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-sm font-medium hidden sm:block">{vendor?.name || vendor?.fullName}</p>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition inline-flex items-center gap-1.5 sm:gap-2"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
              <button
                onClick={() => setActiveTab('kyc')}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Complete KYC →
              </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
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
        <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-full overflow-x-auto no-scrollbar">
          {['overview', 'jobs', 'wallet', 'services', 'kyc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium capitalize rounded-full transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'kyc' ? 'KYC' : tab}
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

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="max-w-lg">
            {kyc?.status === 'approved' ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
                <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">KYC Verified</h3>
                <p className="text-sm text-muted-foreground">Your identity has been verified. You can now create services and receive payments.</p>
              </div>
            ) : kyc?.status === 'pending' || kycSuccess ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
                <Clock size={40} className="text-yellow-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">KYC Under Review</h3>
                <p className="text-sm text-muted-foreground">Your documents are being reviewed. This usually takes 24-48 hours.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-float">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Verify Your Identity</h3>
                  <p className="text-sm text-muted-foreground">Complete KYC to unlock services and receive payments.</p>
                </div>
                <form onSubmit={handleKycSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name (as on ID)</label>
                    <input
                      type="text"
                      value={kycForm.fullName}
                      onChange={(e) => setKycForm({ ...kycForm, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">BVN</label>
                    <input
                      type="text"
                      value={kycForm.bvn}
                      onChange={(e) => setKycForm({ ...kycForm, bvn: e.target.value })}
                      placeholder="22012345678"
                      maxLength={11}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Document Type</label>
                    <select
                      value={kycForm.documentType}
                      onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="national_id">National ID (NIN Slip)</option>
                      <option value="drivers_license">Driver&apos;s License</option>
                      <option value="international_passport">International Passport</option>
                      <option value="voters_card">Voter&apos;s Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Upload Document</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload size={24} className="text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {kycFile ? kycFile.name : 'Click to upload (JPG, PNG, PDF)'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {kycError && <p className="text-red-600 text-sm" role="alert">{kycError}</p>}
                  <button
                    type="submit"
                    disabled={kycSubmitting}
                    className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
                  >
                    {kycSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText size={18} /> Submit KYC
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
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
    </div>
  );
}
