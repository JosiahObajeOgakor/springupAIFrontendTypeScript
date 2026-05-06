import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  vendorId: string | null;
  vendor: any | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
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
