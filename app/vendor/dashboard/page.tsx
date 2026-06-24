'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, CheckCircle, Clock, DollarSign, Wallet, AlertTriangle, Upload, FileText, Briefcase, BanknoteIcon, Copy, Share2, Gift, MessageCircle, BookOpen, PackageSearch, ArrowDownCircle, Loader2, TrendingUp } from 'lucide-react';
import { getVendorServices, checkPlan, getKycStatus, getKycPresignUrl, submitKyc, overrideKyc, withdraw, uploadEbook, listEbooks, getHardCopyStatus, confirmHardCopyDelivery, requestEbookAdvance, createService, uploadWithProgress } from '@/lib/api';
import type { VendorService, PlanCheckResponse, KycStatusResponse, Ebook, HardCopyStatusResponse } from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { clearAuth } from '@/lib/store/authSlice';
import { useVendorDashboardStore } from '@/lib/stores/vendor-dashboard-store';
import { ProtectedRoute } from '@/components/protected-route';
import { ImageCropperDialog } from '@/components/image-cropper-dialog';
import { Logo } from '@/components/logo';
import { TierApplyCard } from '@/components/tier-apply-card';
import { PayoutRequestCard } from '@/components/payout-request-card';
import { VendorProfileEditCard } from '@/components/vendor-profile-edit-card';
import { WalletCard } from '@/components/wallet-card';
import { EscrowLifecycleCard } from '@/components/escrow-lifecycle-card';
import { MediationThreadCard } from '@/components/mediation-thread-card';

import { toast } from 'sonner';

export default function VendorDashboard() {
  return <DashboardContent />;
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
  // Minor UI state lives in the Zustand vendor-dashboard store.
  const activeTab = useVendorDashboardStore((s) => s.activeTab);
  const setActiveTab = useVendorDashboardStore((s) => s.setActiveTab);

  // Ebook state
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [ebookForm, setEbookForm] = useState({ title: '', author: '', price: '' });
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [ebookUploading, setEbookUploading] = useState(false);
  const [ebookUploadError, setEbookUploadError] = useState('');
  const [ebookUploadSuccess, setEbookUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ebooksLoading, setEbooksLoading] = useState(false);

  // Deliveries / advance state
  const [deliveryOrderId, setDeliveryOrderId] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<HardCopyStatusResponse | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [confirmDeliveryOrderId, setConfirmDeliveryOrderId] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Service creation state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '', category: '', description: '', price: '', available: true,
    work_type: '' as '' | 'soft' | 'physical',
    location: '', nearest_landmark: '', pickup_radius_km: '', service_hours_from: '', service_hours_to: '',
  });
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // Advance request state
  const [advanceForm, setAdvanceForm] = useState({ order_id: '', amount: '', reason: '' });
  const [advanceSubmitting, setAdvanceSubmitting] = useState(false);
  const [advanceError, setAdvanceError] = useState('');
  const [advanceSuccess, setAdvanceSuccess] = useState(false);

  // Detect return from Paystack via ?kyc_paid=1 query param.
  const kycReturnRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('kyc_paid') === '1') {
      kycReturnRef.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete('kyc_paid');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // KYC verification wizard — state lives in the Zustand vendor-dashboard store.
  // Thin local adapters keep the existing call sites (setKycForm/setKycFile/…)
  // unchanged while the source of truth is the store.
  const kycWizard = useVendorDashboardStore((s) => s.kyc);
  const patchKyc = useVendorDashboardStore((s) => s.patchKyc);
  const kycForm = kycWizard;
  const setKycForm = (patch: Partial<typeof kycWizard>) => patchKyc(patch);
  const kycFile = kycWizard.file;
  const setKycFile = (file: File | null) => patchKyc({ file });
  const kycSubmitting = kycWizard.submitting;
  const setKycSubmitting = (v: boolean) => patchKyc({ submitting: v });
  const kycSuccess = kycWizard.success;
  const setKycSuccess = (v: boolean) => patchKyc({ success: v });
  const kycError = kycWizard.error;
  const setKycError = (v: string) => patchKyc({ error: v });
  const kycOverriding = kycWizard.overriding;
  const setKycOverriding = (v: boolean) => patchKyc({ overriding: v });
  const cropperOpen = kycWizard.cropperOpen;
  const setCropperOpen = (v: boolean) => patchKyc({ cropperOpen: v });
  const cropperImageSrc = kycWizard.cropperImageSrc;
  const setCropperImageSrc = (v: string) => patchKyc({ cropperImageSrc: v });
  const [isLocalDev, setIsLocalDev] = useState(false);

  useEffect(() => {
    setIsLocalDev(window.location.hostname === 'localhost');
  }, []);

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
        }
      }, 1000);
    }, 2 * 60 * 1000); // 2 minutes idle
  }, [clearIdleTimers, dispatch]);

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
    async function fetchData() {
      try {
        const [svc, planData, kycData, ebookData] = await Promise.all([
          vendorId ? getVendorServices(vendorId) : Promise.resolve([]),
          vendorId ? checkPlan(vendorId).catch(() => null) : Promise.resolve(null),
          vendorId ? getKycStatus(vendorId).catch(() => null) : Promise.resolve(null),
          listEbooks().catch(() => []),
        ]);
        setServices(svc || []);
        setPlan(planData);
        setKyc(kycData);
        setEbooks(ebookData);

        // If returning from Paystack, kick off status polling immediately.
        if (kycReturnRef.current && vendorId) {
          kycReturnRef.current = false;
          startKycStatusPoll(vendorId);
        }
      } catch {
        // silently fail — no redirect
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vendorId]);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push('/vendor/login');
  };

  const handleDevKycApprove = async () => {
    if (!vendorId) return;
    setKycOverriding(true);
    try {
      await overrideKyc({ vendor_id: vendorId, kyc_status: 'approved' });
      setKyc({ status: 'approved' });
    } catch {
      setKycError('Dev override failed — check admin token.');
    } finally {
      setKycOverriding(false);
    }
  };

  const startKycStatusPoll = (vid: string) => {
    let calls = 0;
    const poll = setInterval(async () => {
      calls += 1;
      try {
        const latest = await getKycStatus(vid);
        setKyc(latest);
        if (latest.status === 'verified' || latest.status === 'approved' || latest.status === 'rejected' || calls >= 3) {
          clearInterval(poll);
        }
      } catch {
        clearInterval(poll);
      }
    }, 5000);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFile || !kycForm.idNumber) {
      setKycError('Upload your ID and enter your NIN or BVN');
      return;
    }
    if (!vendorId) {
      setKycError('Vendor session not found. Please log in again.');
      return;
    }
    setKycError('');
    setKycSubmitting(true);
    setUploadProgress(0);
    try {
      const presign = await getKycPresignUrl({
        vendor_id: vendorId,
        type: kycForm.documentType,
      });
      await uploadWithProgress(presign.put_url, kycFile, {
        method: 'PUT',
        headers: { 'Content-Type': kycFile.type },
        onProgress: (p) => setUploadProgress(p),
        noAuth: true,
      });
      const result = await submitKyc({
        vendor_id: vendorId,
        method: kycForm.method,
        callback_url: `${window.location.origin}/vendor/dashboard?kyc_paid=1`,
        ...(kycForm.method === 'bvn'
          ? { bvn: kycForm.idNumber }
          : { nin: kycForm.idNumber }),
      });
      setKycSuccess(true);
      setKyc({ vendor_id: vendorId, status: result.status || 'payment_pending', method: kycForm.method });

      // KYC payment will happen via Paystack webhook. Payment URL is stored in result but not used here.
      // User will upgrade to a plan separately via the Tier/Upgrade tab.
    } catch {
      setKycError('KYC submission failed. Please try again.');
    } finally {
      setKycSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {    e.preventDefault();
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

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.category || !serviceForm.price || !serviceForm.work_type) {
      setServiceError('Title, category, price and service type are required.');
      return;
    }
    const hoursStr = serviceForm.service_hours_from && serviceForm.service_hours_to
      ? `${serviceForm.service_hours_from} – ${serviceForm.service_hours_to}`
      : undefined;
    setServiceError('');
    setServiceSubmitting(true);
    try {
      await createService({
        vendor_id: vendorId ?? '',
        title: serviceForm.title,
        category: serviceForm.category,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        available: serviceForm.available,
        work_type: serviceForm.work_type as 'soft' | 'physical',
        location: serviceForm.location || undefined,
        nearest_landmark: serviceForm.nearest_landmark || undefined,
        pickup_radius_km: serviceForm.pickup_radius_km ? Number(serviceForm.pickup_radius_km) : undefined,
        service_hours: hoursStr,
      });
      setShowServiceForm(false);
      setServiceForm({ title: '', category: '', description: '', price: '', available: true, work_type: '', location: '', nearest_landmark: '', pickup_radius_km: '', service_hours_from: '', service_hours_to: '' });
      const updated = await getVendorServices(vendorId ?? '').catch(() => services);
      setServices(updated);
      toast.success('Service added.');
    } catch {
      setServiceError('Failed to add service. Ensure your KYC is approved and you have an active plan.');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleEbookUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookFile || !ebookForm.title || !ebookForm.author || !ebookForm.price) {
      setEbookUploadError('All fields including the PDF file are required.');
      return;
    }
    setEbookUploadError('');
    setEbookUploading(true);
    setUploadProgress(0);
    try {
      await uploadEbook({
        file: ebookFile,
        title: ebookForm.title,
        author: ebookForm.author,
        price: Math.round(Number(ebookForm.price) * 100),
      }, (p) => setUploadProgress(p));
      setEbookUploadSuccess(true);
      setEbookForm({ title: '', author: '', price: '' });
      setEbookFile(null);
      setEbooksLoading(true);
      const refreshed = await listEbooks().catch(() => ebooks);
      setEbooks(refreshed);
      setEbooksLoading(false);
    } catch {
      setEbookUploadError('Upload failed. Please try again.');
    } finally {
      setEbookUploading(false);
    }
  };

  const handleDeliveryLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrderId.trim()) { setDeliveryError('Enter an order ID.'); return; }
    setDeliveryError('');
    setDeliveryLoading(true);
    setDeliveryStatus(null);
    try {
      const status = await getHardCopyStatus(deliveryOrderId.trim());
      setDeliveryStatus(status);
    } catch {
      setDeliveryError('Order not found or you do not have access.');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmDeliveryOrderId.trim()) { setConfirmError('Enter an order ID.'); return; }
    setConfirmError('');
    setConfirmingDelivery(true);
    try {
      await confirmHardCopyDelivery({ order_id: confirmDeliveryOrderId.trim() });
      setConfirmSuccess(true);
      setConfirmDeliveryOrderId('');
    } catch {
      setConfirmError('Confirmation failed. Please check the order ID.');
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handleAdvanceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceForm.order_id || !advanceForm.amount || !advanceForm.reason) {
      setAdvanceError('All fields are required.');
      return;
    }
    setAdvanceError('');
    setAdvanceSubmitting(true);
    try {
      await requestEbookAdvance({
        order_id: advanceForm.order_id.trim(),
        amount: Math.round(Number(advanceForm.amount) * 100),
        reason: advanceForm.reason.trim(),
      });
      setAdvanceSuccess(true);
      setAdvanceForm({ order_id: '', amount: '', reason: '' });
    } catch {
      setAdvanceError('Advance request failed. Please try again.');
    } finally {
      setAdvanceSubmitting(false);
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
                onClick={() => {
                  setActiveTab('kyc');
                  setTimeout(() => {
                    document.getElementById('kyc-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Complete KYC →
              </button>
            </div>
          </div>
        )}

        {/* Trial warning banner */}
        {plan && !plan.active && plan.warning && (
          <div className="mb-6 rounded-2xl p-4 border border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 flex items-start gap-3">
            <AlertTriangle size={20} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-orange-800 dark:text-orange-200">Trial ending soon</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-0.5">{plan.warning}</p>
              <button
                onClick={() => setActiveTab('tier')}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Upgrade now →
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

        <div className="mb-8 rounded-3xl border border-border bg-card shadow-float overflow-hidden">
          <div className="gradient-primary px-6 py-6 text-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">Shared chat flow</p>
              <h3 className="text-xl font-bold mb-1">Start the same WhatsApp-style chat vendors and users use</h3>
              <p className="text-sm text-white/80 max-w-2xl">Use your 11 digit Nigerian phone number to initiate a web chat session. This now routes vendors through the same shared entry point as the public site.</p>
            </div>
            <Link
              href="/chat?source=vendor"
              className="shrink-0 px-5 py-3 rounded-full bg-white text-primary font-semibold inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={18} /> Start Chat
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-full overflow-x-auto no-scrollbar">
          {['overview', 'ebooks', 'transactions', 'deliveries', 'wallet', 'services', 'kyc', 'tier', 'payout', 'profile', 'escrow', 'mediation', 'referral'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium capitalize rounded-full transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'kyc' ? 'KYC' : tab === 'tier' ? 'Tier / Upgrade' : tab === 'payout' ? 'Payout' : tab === 'profile' ? 'Edit Profile' : tab === 'escrow' ? 'Escrow' : tab === 'mediation' ? 'Mediation' : tab}
            </button>
          ))}
        </div>

        {/* Ebooks Tab */}
        {activeTab === 'ebooks' && (
          <div className="space-y-8">
            {/* Upload form */}
            <div className="bg-card rounded-3xl border border-border shadow-float overflow-hidden">
              <div className="gradient-primary px-6 py-5 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Upload E-book</h3>
                  <p className="text-white/75 text-sm">PDF only · Price in Naira</p>
                </div>
              </div>
              <div className="p-6">
                {ebookUploadSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-1">E-book Uploaded!</h4>
                    <p className="text-sm text-muted-foreground mb-5">Your book is now live in the catalog.</p>
                    <button onClick={() => setEbookUploadSuccess(false)} className="text-sm font-medium text-primary hover:underline">Upload another</button>
                  </div>
                ) : (
                  <form onSubmit={handleEbookUpload} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Book title</label>
                        <input
                          type="text"
                          value={ebookForm.title}
                          onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                          placeholder="e.g. The Entrepreneur's Playbook"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Author</label>
                        <input
                          type="text"
                          value={ebookForm.author}
                          onChange={(e) => setEbookForm({ ...ebookForm, author: e.target.value })}
                          placeholder="e.g. Chioma Okafor"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Price (₦)</label>
                      <input
                        type="number"
                        value={ebookForm.price}
                        onChange={(e) => setEbookForm({ ...ebookForm, price: e.target.value })}
                        placeholder="e.g. 2500"
                        min="1"
                        className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">PDF file</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                        <Upload size={22} className="text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {ebookFile ? ebookFile.name : 'Click to select PDF'}
                        </span>
                        <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={(e) => setEbookFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    {ebookUploadError && <p className="text-sm text-destructive" role="alert">{ebookUploadError}</p>}
                    {ebookUploading && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Uploading PDF...</span>
                          <span className="font-semibold text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={ebookUploading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 shadow-elevated"
                    >
                      {ebookUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload E-book</>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Ebook catalog */}
            <div>
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" /> Your catalog ({ebooks.length})
              </h3>
              {ebooksLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-6"><Loader2 size={16} className="animate-spin" /> Loading...</div>
              ) : ebooks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No e-books uploaded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium">Title</th>
                        <th className="px-5 py-3 text-left font-medium">Author</th>
                        <th className="px-5 py-3 text-right font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {ebooks.map((book) => (
                        <tr key={book.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-5 py-3.5 font-medium">{book.title}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{book.author}</td>
                          <td className="px-5 py-3.5 text-right font-semibold text-primary">₦{(book.price / 100).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> E-book Sales
              </h3>
              <p className="text-sm text-muted-foreground mb-5">Your uploaded books and their pricing. Sales are released after buyer delivery confirmation.</p>
              {ebooks.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border text-muted-foreground">
                  <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No ebooks yet. Upload your first book to start earning.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium">Title</th>
                        <th className="px-5 py-3 text-left font-medium">Author</th>
                        <th className="px-5 py-3 text-right font-medium">List Price</th>
                        <th className="px-5 py-3 text-right font-medium">Your Earn (est.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {ebooks.map((book) => (
                        <tr key={book.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-5 py-3.5 font-medium">{book.title}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{book.author}</td>
                          <td className="px-5 py-3.5 text-right">₦{(book.price / 100).toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right font-semibold text-green-600 dark:text-green-400">
                            ₦{((book.price / 100) * 0.9).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Advance request */}
            <div className="bg-card rounded-3xl border border-border shadow-float overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowDownCircle size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Request Advance</h4>
                  <p className="text-xs text-muted-foreground">Up to 40% of pending escrow · reviewed within 3 working days</p>
                </div>
              </div>
              <div className="p-6">
                {advanceSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                    <h4 className="font-bold mb-1">Advance Request Submitted</h4>
                    <p className="text-sm text-muted-foreground mb-4">You&apos;ll hear back within 3 working days.</p>
                    <button onClick={() => setAdvanceSuccess(false)} className="text-sm text-primary hover:underline font-medium">Submit another</button>
                  </div>
                ) : (
                  <form onSubmit={handleAdvanceRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Order ID</label>
                      <input
                        type="text"
                        value={advanceForm.order_id}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, order_id: e.target.value })}
                        placeholder="Order ID for the hard copy sale"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Advance amount (₦) <span className="text-muted-foreground font-normal">— max 40% of escrow</span></label>
                      <input
                        type="number"
                        value={advanceForm.amount}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                        placeholder="e.g. 1000"
                        min="1"
                        className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Reason</label>
                      <textarea
                        value={advanceForm.reason}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                        placeholder="Brief reason for the advance request..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm resize-none"
                      />
                    </div>
                    {advanceError && <p className="text-sm text-destructive">{advanceError}</p>}
                    <button
                      type="submit"
                      disabled={advanceSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 shadow-elevated"
                    >
                      {advanceSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><ArrowDownCircle size={14} /> Submit Request</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-8 max-w-2xl">
            {/* Track delivery */}
            <div className="bg-card rounded-3xl border border-border shadow-float overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PackageSearch size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Track Hard Copy Delivery</h4>
                  <p className="text-xs text-muted-foreground">Enter an order ID to check status</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <form onSubmit={handleDeliveryLookup} className="flex gap-3">
                  <input
                    type="text"
                    value={deliveryOrderId}
                    onChange={(e) => setDeliveryOrderId(e.target.value)}
                    placeholder="Paste order ID..."
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={deliveryLoading}
                    className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {deliveryLoading ? <Loader2 size={15} className="animate-spin" /> : <PackageSearch size={15} />}
                    Check
                  </button>
                </form>
                {deliveryError && <p className="text-sm text-destructive">{deliveryError}</p>}
                {deliveryStatus && (
                  <div className="rounded-2xl bg-secondary/50 border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
                        deliveryStatus.status === 'delivered' || deliveryStatus.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : deliveryStatus.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>{deliveryStatus.status}</span>
                    </div>
                    {deliveryStatus.tracking_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tracking #</span>
                        <span className="text-sm font-mono font-medium">{deliveryStatus.tracking_number}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm delivery (buyer side) */}
            <div className="bg-card rounded-3xl border border-border shadow-float overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Confirm Delivery Received</h4>
                  <p className="text-xs text-muted-foreground">Buyer confirms receipt — releases escrow to vendor immediately</p>
                </div>
              </div>
              <div className="p-6">
                {confirmSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                    <h4 className="font-bold mb-1">Delivery Confirmed</h4>
                    <p className="text-sm text-muted-foreground mb-4">Escrow has been released to the vendor.</p>
                    <button onClick={() => setConfirmSuccess(false)} className="text-sm text-primary hover:underline font-medium">Confirm another</button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDelivery} className="flex gap-3">
                    <input
                      type="text"
                      value={confirmDeliveryOrderId}
                      onChange={(e) => setConfirmDeliveryOrderId(e.target.value)}
                      placeholder="Order ID to confirm..."
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={confirmingDelivery}
                      className="px-5 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {confirmingDelivery ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                      Confirm
                    </button>
                  </form>
                )}
                {confirmError && <p className="text-sm text-destructive mt-3">{confirmError}</p>}
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  If a buyer has not confirmed within 48 hours of the shipped status, escrow is auto-released.
                </p>
              </div>
            </div>
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

            {/* Fund / virtual account / internal transfer */}
            <div className="mt-6">
              <WalletCard ownerId={vendorId ?? ''} />
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4 max-w-2xl">
            {services.map((service) => (
              <div key={service.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-semibold truncate">{service.title}</h4>
                      {(service as any).work_type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          (service as any).work_type === 'soft'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {(service as any).work_type === 'soft' ? '💻 Soft / Remote' : '🔧 Physical'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{service.category || 'General'} · ₦{service.price.toLocaleString()}</p>
                    {(service as any).location && (
                      <p className="text-xs text-muted-foreground mt-0.5">📍 {(service as any).location}{(service as any).nearest_landmark ? ` · near ${(service as any).nearest_landmark}` : ''}</p>
                    )}
                    {(service as any).pickup_radius_km && (
                      <p className="text-xs text-muted-foreground mt-0.5">🚗 Within {(service as any).pickup_radius_km} km</p>
                    )}
                    {(service as any).service_hours && (
                      <p className="text-xs text-muted-foreground mt-0.5">🕐 {(service as any).service_hours}</p>
                    )}
                    {service.description && <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{service.description}</p>}
                  </div>
                  <div className={`shrink-0 w-10 h-6 rounded-full p-0.5 transition-colors ${service.available ? 'bg-primary' : 'bg-border'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${service.available ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            ))}

            {services.length === 0 && !showServiceForm && (
              <div className="text-center py-10 text-muted-foreground">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No services yet. Add your first service below.</p>
              </div>
            )}

            {showServiceForm ? (
              <div className="bg-card rounded-3xl border border-border shadow-float overflow-hidden">
                <div className="gradient-primary px-5 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                      <Plus size={16} />
                    </div>
                    <span className="font-semibold">New Service</span>
                  </div>
                  <button onClick={() => { setShowServiceForm(false); setServiceError(''); }} className="text-white/70 hover:text-white transition text-xl leading-none">×</button>
                </div>
                <form onSubmit={handleAddService} className="p-5 space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Service title <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      placeholder="e.g. House Cleaning"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    >
                      <option value="">Select a category</option>
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
                      <optgroup label="Beauty & Personal Care">
                        <option value="Haircut">Haircut / Barbing</option>
                        <option value="Braiding">Hair Braiding / Styling</option>
                        <option value="Makeup">Makeup Artist</option>
                        <option value="Manicure & Pedicure">Manicure &amp; Pedicure</option>
                        <option value="Massage">Massage Therapy</option>
                        <option value="Skincare">Skincare / Facial</option>
                      </optgroup>
                      <optgroup label="Logistics & Transport">
                        <option value="Dispatch">Dispatch / Delivery</option>
                        <option value="Moving">House Moving / Relocation</option>
                        <option value="Ride">Ride / Chauffeur</option>
                        <option value="Errand">Errand Running</option>
                      </optgroup>
                      <optgroup label="Tech & Digital">
                        <option value="Phone Repair">Phone / Gadget Repair</option>
                        <option value="Laptop Repair">Laptop Repair</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Web Design">Web Design</option>
                        <option value="Social Media">Social Media Management</option>
                        <option value="Photography">Photography</option>
                        <option value="Videography">Videography</option>
                      </optgroup>
                      <optgroup label="Education & Training">
                        <option value="Tutoring">Private Tutoring</option>
                        <option value="Driving Lessons">Driving Lessons</option>
                        <option value="Fitness Training">Fitness / Personal Training</option>
                        <option value="Cooking Classes">Cooking Classes</option>
                      </optgroup>
                      <optgroup label="Food & Catering">
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

                  {/* Service type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Type of service <span className="text-destructive">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'soft', label: 'Soft / Remote', desc: 'Digital, online or can be done from anywhere', icon: '💻' },
                        { value: 'physical', label: 'Physical / On-site', desc: 'Requires in-person attendance at a location', icon: '🔧' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setServiceForm({ ...serviceForm, work_type: opt.value as 'soft' | 'physical' })}
                          className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all ${
                            serviceForm.work_type === opt.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <span className="text-lg leading-none">{opt.icon}</span>
                          <span className="text-sm font-semibold mt-1">{opt.label}</span>
                          <span className="text-xs text-muted-foreground leading-snug">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      placeholder="Briefly describe what you offer..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Location + nearest landmark */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Your location</label>
                      <input
                        type="text"
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                        placeholder="e.g. Lekki Phase 1, Lagos"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Nearest landmark</label>
                      <input
                        type="text"
                        value={serviceForm.nearest_landmark}
                        onChange={(e) => setServiceForm({ ...serviceForm, nearest_landmark: e.target.value })}
                        placeholder="e.g. Shoprite, Admiralty Way"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Pickup radius + service hours */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Closest pickup radius</label>
                      <select
                        value={serviceForm.pickup_radius_km}
                        onChange={(e) => setServiceForm({ ...serviceForm, pickup_radius_km: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      >
                        <option value="">Select radius</option>
                        <option value="1">Within 1 km</option>
                        <option value="2">Within 2 km</option>
                        <option value="3">Within 3 km</option>
                        <option value="4">Within 4 km</option>
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km (max)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Service hours</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={serviceForm.service_hours_from}
                          onChange={(e) => setServiceForm({ ...serviceForm, service_hours_from: e.target.value })}
                          className="flex-1 px-3 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                        />
                        <span className="text-muted-foreground text-xs font-medium shrink-0">to</span>
                        <input
                          type="time"
                          value={serviceForm.service_hours_to}
                          onChange={(e) => setServiceForm({ ...serviceForm, service_hours_to: e.target.value })}
                          className="flex-1 px-3 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price + availability */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Price (₦) <span className="text-destructive">*</span></label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                        placeholder="e.g. 5000"
                        min="1"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Availability</label>
                      <select
                        value={serviceForm.available ? 'true' : 'false'}
                        onChange={(e) => setServiceForm({ ...serviceForm, available: e.target.value === 'true' })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      >
                        <option value="true">Available now</option>
                        <option value="false">Not available</option>
                      </select>
                    </div>
                  </div>

                  {serviceError && <p className="text-sm text-destructive">{serviceError}</p>}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={serviceSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 shadow-elevated"
                    >
                      {serviceSubmitting ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add Service</>}
                    </button>
                    <button type="button" onClick={() => { setShowServiceForm(false); setServiceError(''); }} className="px-5 py-3 rounded-full border border-border text-sm font-medium hover:bg-secondary transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowServiceForm(true)}
                className="w-full px-4 py-3.5 border-2 border-dashed border-border text-muted-foreground rounded-2xl font-medium hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add New Service
              </button>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div id="kyc-section" className="max-w-lg">
            {kyc?.status === 'approved' ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle size={40} className="text-green-600 mx-auto" />
                <h3 className="font-bold text-lg">KYC Verified</h3>
                <p className="text-sm text-muted-foreground">Your identity has been verified. You can now create services and receive payments.</p>
                {!plan?.active && (
                  <button
                    onClick={() => setActiveTab('tier')}
                    className="mt-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:scale-105 transition-transform"
                  >
                    Upgrade to a paid tier →
                  </button>
                )}
              </div>
            ) : kyc?.status === 'pending' || kyc?.status === 'payment_pending' || kycSuccess ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
                <Clock size={40} className="text-yellow-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">KYC Verification Pending</h3>
                <p className="text-sm text-muted-foreground">We&apos;ve received your details and started the ₦5,000 verification payment. Your account is verified automatically once the payment is confirmed.</p>
                <button
                  type="button"
                  onClick={() => { setKycSuccess(false); setKyc(null); }}
                  className="mt-4 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
                >
                  Try again →
                </button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-float">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Verify Your Identity</h3>
                  <p className="text-sm text-muted-foreground">Complete KYC to unlock services and receive payments.</p>
                </div>
                <form onSubmit={handleKycSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Verification Method</label>
                    <select
                      value={kycForm.method}
                      onChange={(e) => setKycForm({ ...kycForm, method: e.target.value as 'nin' | 'bvn' })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="nin">NIN (National Identification Number)</option>
                      <option value="bvn">BVN (Bank Verification Number)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{kycForm.method === 'bvn' ? 'BVN' : 'NIN'}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={kycForm.idNumber}
                      onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                      placeholder={kycForm.method === 'bvn' ? '22012345678' : '12345678901'}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.type.startsWith('image/')) {
                            const url = URL.createObjectURL(file);
                            setCropperImageSrc(url);
                            setCropperOpen(true);
                          } else {
                            setKycFile(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {kycError && <p className="text-red-600 text-sm" role="alert">{kycError}</p>}
                  {kycSubmitting && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Uploading document...</span>
                        <span className="font-semibold text-primary">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
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
            <ImageCropperDialog
              open={cropperOpen}
              imageSrc={cropperImageSrc}
              onCrop={(file) => {
                setKycFile(file);
                setCropperOpen(false);
                URL.revokeObjectURL(cropperImageSrc);
                setCropperImageSrc('');
              }}
              onCancel={() => {
                setCropperOpen(false);
                URL.revokeObjectURL(cropperImageSrc);
                setCropperImageSrc('');
              }}
            />
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

        {/* Tier / Upgrade Tab */}
        {activeTab === 'tier' && (
          <div className="max-w-lg">
            <TierApplyCard
              vendorId={vendorId ?? ''}
              vendorEmail={(vendor as any)?.email ?? ''}
            />
          </div>
        )}

        {/* Payout Tab */}
        {activeTab === 'payout' && (
          <div className="max-w-lg">
            <PayoutRequestCard vendorId={vendorId ?? ''} />
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <VendorProfileEditCard
              initial={{
                name: (vendor as any)?.name,
                category: (vendor as any)?.category,
                location: (vendor as any)?.location,
                bio: (vendor as any)?.bio,
              }}
            />
          </div>
        )}

        {/* Escrow Tab */}
        {activeTab === 'escrow' && (
          <div className="max-w-lg">
            <EscrowLifecycleCard />
          </div>
        )}

        {/* Mediation Tab */}
        {activeTab === 'mediation' && (
          <div className="max-w-lg">
            <MediationThreadCard />
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

    </div>
  );
}
