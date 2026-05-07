'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, CheckCircle, Clock, DollarSign, Wallet, Zap, AlertTriangle, Upload, FileText, Briefcase, BanknoteIcon, Link2, Copy, Share2, Gift } from 'lucide-react';
import { getVendorServices, checkPlan, getKycStatus, getKycPresignUrl, submitKyc, withdraw } from '@/lib/api';
import type { VendorService, PlanCheckResponse, KycStatusResponse } from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { clearAuth } from '@/lib/store/authSlice';
import { ProtectedRoute } from '@/components/protected-route';
import { Logo } from '@/components/logo';
import { MusicPlayer } from '@/components/music-player';
import { toast } from 'sonner';

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

  // Wallet withdraw form state
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankCode: '', accountNumber: '' });
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Idle timeout state
  const [idleWarning, setIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(30);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    idleTimerRef.current = null;
    graceTimerRef.current = null;
  }, []);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIdleWarning(true);
      let seconds = 30;
      setIdleCountdown(seconds);
      graceTimerRef.current = setInterval(() => {
        seconds -= 1;
        setIdleCountdown(seconds);
        if (seconds <= 0) {
          clearIdleTimers();
          setIdleWarning(false);
          dispatch(clearAuth());
          router.push('/vendor/login');
        }
      }, 1000);
    }, 2 * 60 * 1000); // 2 minutes idle
  }, [clearIdleTimers, dispatch, router]);

  const confirmActive = useCallback(() => {
    clearIdleTimers();
    setIdleWarning(false);
    startIdleTimer();
  }, [clearIdleTimers, startIdleTimer]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
    const handleActivity = () => {
      if (!graceTimerRef.current) startIdleTimer();
    };
    for (const e of events) window.addEventListener(e, handleActivity, { passive: true });
    startIdleTimer();
    return () => {
      for (const e of events) window.removeEventListener(e, handleActivity);
      clearIdleTimers();
    };
  }, [startIdleTimer, clearIdleTimers]);

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawForm.amount || !withdrawForm.bankCode || !withdrawForm.accountNumber) {
      setWithdrawError('All fields are required');
      return;
    }
    setWithdrawError('');
    setWithdrawing(true);
    try {
      await withdraw({
        amount: Number(withdrawForm.amount),
        bank_code: withdrawForm.bankCode,
        account_number: withdrawForm.accountNumber,
      });
      setWithdrawSuccess(true);
      setWithdrawForm({ amount: '', bankCode: '', accountNumber: '' });
    } catch {
      setWithdrawError('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
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
          {['overview', 'jobs', 'wallet', 'services', 'kyc', 'referral'].map((tab) => (
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
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Jobs Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You&apos;ll be able to view and accept job requests from customers here. Stay tuned!
            </p>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="max-w-md">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-4">
              <p className="text-xs text-muted-foreground mb-1">Plan Status</p>
              <p className="text-2xl font-bold">{plan?.active ? `${plan.plan} (Active)` : 'No active plan'}</p>
            </div>

            {withdrawSuccess ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
                <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Withdrawal Requested</h3>
                <p className="text-sm text-muted-foreground">Your withdrawal is being processed. You&apos;ll receive the funds shortly.</p>
                <button onClick={() => setWithdrawSuccess(false)} className="mt-4 text-sm font-medium text-primary hover:underline">Make another withdrawal</button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-float">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><BanknoteIcon size={20} className="text-primary" /> Withdraw to Bank</h3>
                  <p className="text-sm text-muted-foreground">Enter your bank details to withdraw your earnings.</p>
                </div>
                <form onSubmit={handleWithdraw} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Amount (₦)</label>
                    <input
                      type="number"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      placeholder="5000"
                      min="100"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Bank</label>
                    <select
                      value={withdrawForm.bankCode}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, bankCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="">Select bank</option>
                      <option value="044">Access Bank</option>
                      <option value="023">Citibank</option>
                      <option value="063">Diamond Bank</option>
                      <option value="050">EcoBank</option>
                      <option value="084">Enterprise Bank</option>
                      <option value="070">Fidelity Bank</option>
                      <option value="011">First Bank</option>
                      <option value="214">FCMB</option>
                      <option value="058">GTBank</option>
                      <option value="030">Heritage Bank</option>
                      <option value="301">Jaiz Bank</option>
                      <option value="082">Keystone Bank</option>
                      <option value="526">Parallex Bank</option>
                      <option value="076">Polaris Bank</option>
                      <option value="101">Providus Bank</option>
                      <option value="221">Stanbic IBTC</option>
                      <option value="068">Standard Chartered</option>
                      <option value="232">Sterling Bank</option>
                      <option value="100">Suntrust Bank</option>
                      <option value="032">Union Bank</option>
                      <option value="033">United Bank for Africa</option>
                      <option value="215">Unity Bank</option>
                      <option value="035">Wema Bank</option>
                      <option value="057">Zenith Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={withdrawForm.accountNumber}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                      placeholder="0123456789"
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  {withdrawError && <p className="text-red-600 text-sm" role="alert">{withdrawError}</p>}
                  <button
                    type="submit"
                    disabled={withdrawing}
                    className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-elevated"
                  >
                    {withdrawing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet size={18} /> Withdraw
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
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

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="max-w-lg">
            <div className="bg-card rounded-2xl border border-border shadow-float overflow-hidden">
              <div className="gradient-primary p-6 sm:p-8 text-center text-white">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Gift size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Refer &amp; Earn ₦500</h3>
                <p className="text-white/80 text-sm">Share your link. When someone signs up and completes a service, you both earn ₦500.</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your Referral Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://springupai.com'}/vendor/signup?ref=${vendorId}`}
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-secondary text-sm truncate"
                    />
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/vendor/signup?ref=${vendorId}`;
                        navigator.clipboard.writeText(link);
                        toast.success('Link copied to clipboard!');
                      }}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Share on</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/vendor/signup?ref=${vendorId}`;
                        const text = `Join SpringUpAI and start earning! Sign up here: ${link}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:bg-secondary transition"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span className="text-xs font-medium">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/vendor/signup?ref=${vendorId}`;
                        const text = `Join SpringUpAI and start earning! Sign up here: ${link}`;
                        window.open(`https://www.instagram.com/?url=${encodeURIComponent(link)}`, '_blank');
                        navigator.clipboard.writeText(text);
                        toast('Link copied! Paste it in your Instagram story or bio.');
                      }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:bg-secondary transition"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-pink-600" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      <span className="text-xs font-medium">Instagram</span>
                    </button>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/vendor/signup?ref=${vendorId}`;
                        const text = `Join SpringUpAI and start earning! Sign up here: ${link}`;
                        navigator.clipboard.writeText(text);
                        toast('Link copied! Paste it in your TikTok bio or video caption.');
                      }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:bg-secondary transition"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.35 8.35 0 004.76 1.49V6.77a4.85 4.85 0 01-1-.08z"/></svg>
                      <span className="text-xs font-medium">TikTok</span>
                    </button>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When someone signs up using your link and completes their first bill payment or service booking, you both earn ₦500 bonus credit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* Idle timeout warning modal */}
      {idleWarning && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-8 border border-border shadow-float max-w-sm mx-4 text-center">
            <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Are you still there?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              You&apos;ve been inactive for 2 minutes.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You&apos;ll be logged out in <span className="font-bold text-foreground">{idleCountdown}s</span>
            </p>
            <button
              onClick={confirmActive}
              className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-elevated"
            >
              I&apos;m here
            </button>
          </div>
        </div>
      )}

      {/* Floating Music Player */}
      <MusicPlayer />
    </div>
  );
}
