import { create } from 'zustand';

/**
 * Transient UI / wizard state for the vendor dashboard.
 *
 * Convention for "minor" state:
 *   • cross-component or multi-step (wizard) transient state  → Zustand (here)
 *   • single-field, single-component inputs                   → local useState
 *
 * Worked example: the page-level `activeTab` selector and the multi-step KYC
 * verification wizard live here. The other isolated dashboard forms (ebook
 * upload, deliveries, withdraw, add-service, advance) remain local useState and
 * can be migrated into stores following this same pattern when they need to be
 * shared or grow into wizards.
 */
export type KycMethod = 'nin' | 'bvn';

export interface KycWizardState {
  method: KycMethod;
  idNumber: string;
  documentType: string;
  file: File | null;
  submitting: boolean;
  success: boolean;
  error: string;
  overriding: boolean;
  cropperOpen: boolean;
  cropperImageSrc: string;
}

const initialKyc: KycWizardState = {
  method: 'nin',
  idNumber: '',
  documentType: 'national_id',
  file: null,
  submitting: false,
  success: false,
  error: '',
  overriding: false,
  cropperOpen: false,
  cropperImageSrc: '',
};

interface VendorDashboardState {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  kyc: KycWizardState;
  /** Patch one or more KYC wizard fields. */
  patchKyc: (patch: Partial<KycWizardState>) => void;
  resetKyc: () => void;
}

export const useVendorDashboardStore = create<VendorDashboardState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (activeTab) => set({ activeTab }),

  kyc: initialKyc,
  patchKyc: (patch) => set((s) => ({ kyc: { ...s.kyc, ...patch } })),
  resetKyc: () => set({ kyc: initialKyc }),
}));
