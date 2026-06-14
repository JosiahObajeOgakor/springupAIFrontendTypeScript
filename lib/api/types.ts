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
  /**
   * Admin API key value (the ADMIN_API_KEY secret). Per the Gateway spec
   * (POST /api/v1/admin/login) this is the only required field; the key may
   * also be sent via the X-Admin-Key header.
   */
  secret: string;
}

export interface AdminLoginResponse {
  token: string;
}

/** Generic `{ token }` payload (e.g. POST /api/v1/auth/vendor-token). */
export interface TokenResponse {
  token: string;
  refresh_token?: string;
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
  lat?: number;
  lng?: number;
  referral_code?: string;
  user_id?: string;
}

export interface VendorRegisterResponse {
  token: string;
  vendor: Vendor;
  user_id: string;
  /** Unique identifier for the vendor (usually the phone number). */
  vendor_unique?: string;
  /** Some deployments echo the auto-created user object. */
  user?: Pick<User, "id" | "name" | "phone">;
}

export interface VendorLoginResponse {
  token: string;
  vendor_id: string;
  user: Pick<User, "id" | "name" | "phone">;
}

// PATCH /api/v1/vendor/update — returns the updated Vendor.
export interface VendorUpdatePayload {
  name?: string;
  category?: string;
  location?: string;
  bio?: string;
}

// POST /api/v1/vendor/contact — send a message to a vendor.
export interface VendorContactPayload {
  vendor_id: string;
  message: string;
}

// GET /api/v1/vendor/profile — public profile card with trust signals.
export interface VendorProfile extends Vendor {
  bio?: string;
  rating?: number;
  reviews_count?: number;
  trust_signals?: Record<string, unknown>;
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
  work_type?: 'soft' | 'physical';
  location?: string;
  nearest_landmark?: string;
  pickup_radius_km?: number;
  service_hours?: string;
  available?: boolean;
}

// ─── Vendor Tier ─────────────────────────────────────────────────────────────
// The gateway accepts gold/silver/platinum or the tier_1/2/3 aliases. Listing
// caps: free = 1, gold = 3, silver = 5, platinum = unlimited.
export type VendorTierLevel =
  | 'tier_1'
  | 'tier_2'
  | 'tier_3'
  | 'gold'
  | 'silver'
  | 'platinum';

export interface TierApplyPayload {
  vendor_id: string;
  tier_level: VendorTierLevel;
  email?: string;
  callback_url?: string;
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
  owner_id?: string;
  amount: number;
  provider?: string;
  ref?: string;
}

export interface WalletFundResponse {
  authorization_url: string;
  reference: string;
}

export interface WalletEscrowPayload {
  job_id: string;
  from_id: string;
  to_id: string;
  amount: number;
}

export interface WalletReleasePayload {
  job_id: string;
}

export interface WalletRefundPayload {
  job_id: string;
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

// ─── Mediation ────────────────────────────────────────────────────────────────
// NOTE: the /api/v1/mediation/* endpoints are NOT in the published gateway
// OpenAPI spec. These bindings are kept for backends that expose mediation; the
// web-chat UI itself uses the WhatsApp handoff below, not mediation.
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

// ─── Web Chat (WhatsApp handoff) ──────────────────────────────────────────────
// The gateway has no synchronous chat API; the web entry point captures a phone,
// auto-registers a user, then hands off to WhatsApp. See lib/api/chat.ts.
export type ChatAudience = 'guest' | 'user' | 'vendor' | 'admin';

export interface ChatInitPayload {
  phone: string;
  audience: ChatAudience;
  source?: string;
}

export interface ChatInitResponse {
  /** Whether a brand-new user was auto-registered during this handoff. */
  registered: boolean;
  /** wa.me deep link to continue on WhatsApp, or null if not configured. */
  whatsappUrl: string | null;
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
  session_id?: string;
  current_track_id?: string;
  played_track_ids?: string[];
  buffer_size?: number;
}

export interface RadioPreloadTrack {
  id: string;
  title: string;
  artist?: string;
  duration_secs?: number;
  stream_url: string;
  index: number;
}

export interface RadioPreloadManifest {
  session_id: string;
  next_check_at: number;
  tracks: RadioPreloadTrack[];
}

export interface RadioCheckResponse {
  action: 'continue' | 'stop';
  manifest?: RadioPreloadManifest;
  message?: string;
  blocked?: boolean;
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
// Flow per spec: presign (direct-S3 PUT of a 512x512 ID image) → submit NIN/BVN
// which starts the ₦5,000 Paystack charge backend-side (returns payment_pending;
// the vendor is only verified once the Paystack webhook confirms the charge).
export type KycMethod = 'nin' | 'bvn';

export interface KycPresignPayload {
  vendor_id: string;
  /** Image kind, e.g. national_id. The gateway reads this from the JSON body. */
  type: string;
}

export interface KycPresignResponse {
  put_url: string;
  key: string;
  expires_in_secs?: string;
  recommended?: string;
}

export interface KycSubmitPayload {
  vendor_id: string;
  /** Provide at least one of nin or bvn. */
  nin?: string;
  bvn?: string;
  method?: KycMethod;
  selfie_url?: string;
  doc_front_url?: string;
  doc_back_url?: string;
  /** Optional; derived from the vendor phone if omitted. */
  email?: string;
}

export interface KycSubmitResponse {
  vendor_id: string;
  nin?: string;
  bvn?: string;
  method?: string;
  paystack_ref?: string;
  paystack_status?: string;
  /** e.g. payment_pending */
  status: string;
  updated_at?: string;
}

export interface KycStatusResponse {
  vendor_id?: string;
  status: string;
  paystack_status?: string;
  method?: string;
  /** Optional human-readable reason, surfaced when status is rejected. */
  reason?: string;
}

export interface KycDocumentResponse {
  get_url: string;
  key: string;
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

// ─── Ebooks ──────────────────────────────────────────────────────────────────
export interface Ebook {
  id: string;
  title: string;
  author: string;
  price: number; // kobo
  created_at?: string;
  vendor_id?: string;
}

export interface EbookUploadPayload {
  file: File;
  title: string;
  author: string;
  price: number; // kobo
}

export interface HardCopyStatusResponse {
  status: 'pending' | 'shipped' | 'delivered' | 'confirmed';
  tracking_number: string;
}

export interface EbookAdvanceRequestPayload {
  order_id: string;
  amount: number; // kobo, max 40% of escrow
  reason: string;
}

export interface HardCopyConfirmPayload {
  order_id: string;
}

export interface EbookPurchasePayload {
  ebook_id: string;
}

export interface HardCopyPurchasePayload {
  ebook_id: string;
  delivery_address: string;
  delivery_phone: string;
}
