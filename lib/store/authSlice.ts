import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  vendorId: string | null;
  vendor: Record<string, unknown> | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  vendorId: null,
  vendor: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string;
        vendorId: string;
        vendor?: Record<string, unknown> | null;
      }>
    ) {
      state.token = action.payload.token;
      state.vendorId = action.payload.vendorId;
      state.vendor = action.payload.vendor ?? state.vendor;
      state.isAuthenticated = true;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    updateToken(
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    setVendor(state, action: PayloadAction<Record<string, unknown>>) {
      state.vendor = action.payload;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setCredentials, updateToken, setVendor, clearAuth } = authSlice.actions;

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectVendorId = (state: { auth: AuthState }) =>
  state.auth.vendorId ??
  (state.auth.vendor?.id as string | undefined) ??
  (state.auth.vendor?.vendor_id as string | undefined) ??
  null;
export const selectVendor = (state: { auth: AuthState }) => state.auth.vendor;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
