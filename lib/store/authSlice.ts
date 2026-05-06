import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  vendorId: string | null;
  vendor: any | null;
  isAuthenticated: boolean;
}

function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, vendorId: null, vendor: null, isAuthenticated: false };
  }
  const token = localStorage.getItem('token');
  const vendorId = localStorage.getItem('vendor_id');
  const vendorRaw = localStorage.getItem('vendor');
  const vendor = vendorRaw ? JSON.parse(vendorRaw) : null;
  return {
    token,
    vendorId,
    vendor,
    isAuthenticated: !!token && !!vendorId,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; vendorId: string; vendor?: any }>
    ) {
      state.token = action.payload.token;
      state.vendorId = action.payload.vendorId;
      state.vendor = action.payload.vendor ?? state.vendor;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('vendor_id', action.payload.vendorId);
      if (action.payload.vendor) {
        localStorage.setItem('vendor', JSON.stringify(action.payload.vendor));
      }
    },
    setVendor(state, action: PayloadAction<any>) {
      state.vendor = action.payload;
      localStorage.setItem('vendor', JSON.stringify(action.payload));
    },
    clearAuth(state) {
      state.token = null;
      state.vendorId = null;
      state.vendor = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('vendor_id');
      localStorage.removeItem('vendor');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { setCredentials, setVendor, clearAuth } = authSlice.actions;
export default authSlice.reducer;
