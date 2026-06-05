// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  name: string;
  language: string;
  location: string;
}

export interface UserProfileResponse {
  user: User;
}

export interface UserUpdatePayload {
  name?: string;
  language?: string;
  location?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: User;
}

export interface RefreshResponse {
  token: string;
  refresh_token: string;
}

export interface AdminLoginPayload {
  phone: string;
  secret: string;
}

export interface AdminLoginResponse {
  token: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────
export interface Vendor {
  id: string;
  user_id: string;
  phone?: string;
  name: string;
  category: string;
  location: string;
  verified: boolean;
  kyc_status: string;
}

export interface VendorRegisterPayload {
  phone: string;
  name: string;
  category: string;
  location: string;
  email?: string;
  password?: string;
}

export interface VendorRegisterResponse {
  token: string;
  vendor: Vendor;
  user_id: string;
}

export interface VendorRegisterByPhonePayload {
  phone: string;
  name: string;
  category: string;
  location: string;
  lat?: number;
  lng?: number;
  referral_code?: string;
}

export interface VendorRegisterByPhoneResponse {
  token: string;
  vendor: Vendor;
  user: Pick<User, "id" | "name" | "phone">;
}

export interface VendorLoginResponse {
  token: string;
  vendor_id: string;
  user: Pick<User, "id" | "name" | "phone">;
}

export interface VendorUpdatePayload {
  name?: string;
  category?: string;
  location?: string;
}

export interface VendorContactPayload {
  vendor_id: string;
  message: string;
}

// ─── Vendor Services ─────────────────────────────────────────────────────────
export interface VendorService {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category?: string;
  available: boolean;
}

export interface CreateServicePayload {
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category?: string;
}

// ─── Vendor Tier ─────────────────────────────────────────────────────────────
export interface TierApplyPayload {
  tier: string;
}

export interface TierApplyResponse {
  payment_id: string;
  owner_id: string;
  purpose: string;
  amount: number;
  currency: string;
  provider: string;
  client_reference: string;
  provider_reference: string;
  authorization_url: string;
  access_code: string;
  status: string;
  paystack_public_key: string;
  tier_level: string;
}

export interface PlanCheckResponse {
  active: boolean;
  plan: string;
  tier_status: string;
  expires_at: string;
}

// ─── Wallet ──────────────────────────────────────────────────────────────────
export interface WalletFundPayload {
  amount: number;
  currency: string;
  email: string;
}

export interface WalletFundResponse {
  authorization_url: string;
  reference: string;
}

export interface VirtualAccountPayload {
  bank: string;
}

export interface InternalTransferPayload {
  to_user_id: string;
  amount: number;
  narration?: string;
}

export interface WalletWithdrawPayload {
  amount: number;
  bank_code: string;
  account_number: string;
}

// ─── Escrow ──────────────────────────────────────────────────────────────────
export interface EscrowOpenPayload {
  vendor_id: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface EscrowResponse {
  escrow_id: string;
  status: string;
  amount: number;
  currency: string;
  vendor_id: string;
  description?: string;
}

export interface EscrowIdPayload {
  escrow_id: string;
}

// ─── Marketplace ─────────────────────────────────────────────────────────────
export interface MarketplaceSearchPayload {
  query?: string;
  category?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export interface MarketplaceVendor {
  vendor_id: string;
  name: string;
  verified: boolean;
  location: string;
}

export interface MarketplaceSearchResponse {
  vendors: MarketplaceVendor[];
}

export interface JobAcceptPayload {
  job_id: string;
  vendor_id: string;
}

export interface JobCompletePayload {
  job_id: string;
}

// ─── Mediation / Chat ────────────────────────────────────────────────────────
export interface OpenConversationPayload {
  participant_id: string;
  subject?: string;
}

export interface Conversation {
  id: string;
  participant_id: string;
  subject?: string;
  created_at?: string;
}

export interface SendMessagePayload {
  conversation_id: string;
  content: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatInitPayload {
  phone: string;
  audience: 'guest' | 'vendor';
  source?: string;
}

export interface ChatInitApiResponse {
  conversation_id?: string;
  conversationId?: string;
  session_id?: string;
  sessionId?: string;
}

export interface ChatInitResponse {
  conversationId: string;
}

// ─── Radio / Streaming ──────────────────────────────────────────────────────
export interface RadioTrack {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration_seconds?: number;
  duration?: number;
  mime_type?: string;
  file_name?: string;
  artwork_url?: string;
  stream_url?: string;
  size_bytes?: number;
  uploaded_by?: string;
  created_at?: string;
}

export interface RadioTrackCollectionResponse {
  tracks?: RadioTrack[];
  items?: RadioTrack[];
  data?: RadioTrack[];
  total?: number;
}

export interface RadioSingleUploadPayload {
  file: File;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
}

export interface RadioBatchUploadPayload {
  files: File[];
}

export interface RadioUploadResponse {
  message?: string;
  track?: RadioTrack;
  tracks?: RadioTrack[];
  data?: RadioTrack | RadioTrack[];
}

export interface RadioCheckPayload {
  current_track_id?: string;
  played_track_ids?: string[];
  buffer_size?: number;
}

// ─── Bills / Remita ──────────────────────────────────────────────────────────
export interface AirtimePayload {
  phone: string;
  amount: number;
  network: string;
}

export interface RemitaService {
  category: string;
  biller_name: string;
  commission: string;
  commission_type: string;
  commission_value: number;
  commission_unit: string;
  provider: string;
  supports_vending: boolean;
  requires_amount: boolean;
  requires_customer_reference: boolean;
}

export interface RemitaCatalogResponse {
  provider: string;
  source: string;
  remote_configured: boolean;
  services: RemitaService[];
}

export interface RemitaCategory {
  id: number;
  name: string;
  description: string;
  code: string;
}

export interface RemitaCategoriesResponse {
  message: string;
  status: string;
  data: {
    totalPage: number;
    totalContent: number;
    items: RemitaCategory[];
  };
}

export interface RemitaVendPayload {
  biller_name: string;
  customer_reference: string;
  amount: number;
  phone?: string;
  email?: string;
  category?: string;
  currency?: string;
  narration?: string;
}

export interface RemitaVendResponse {
  status: string;
  provider: string;
  reference: string;
  message: string;
  payload: Record<string, unknown>;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────
export interface KycPresignPayload {
  filename: string;
  content_type: string;
}

export interface KycPresignResponse {
  upload_url: string;
  key: string;
}

export interface KycSubmitPayload {
  document_key: string;
  document_type: string;
  full_name: string;
  bvn: string;
}

export interface KycStatusResponse {
  status: string;
  reason?: string;
}

// ─── Payout ──────────────────────────────────────────────────────────────────
export interface PayoutRequestPayload {
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
}

export interface PayoutStatusResponse {
  payout_id: string;
  status: string;
  amount: number;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export interface PaymentIntentPayload {
  vendor_id: string;
  amount: number;
  currency: string;
  description?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface KycOverridePayload {
  vendor_id: string;
  kyc_status: string;
}

export interface EbookAdvanceReviewPayload {
  request_id: string;
  decision: 'approve' | 'reject';
  reason?: string;
}

export interface EmbedKeyCreatePayload {
  tenant_name?: string;
  domain?: string;
}

export interface EmbedKeyCreateResponse {
  embed_key: string;
  tenant_name: string;
  usage: string;
}

export interface EmbedKeyRevokePayload {
  embed_key: string;
}
