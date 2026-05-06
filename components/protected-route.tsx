'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setCredentials, clearAuth } from '@/lib/store/authSlice';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate auth from localStorage on client
    const token = localStorage.getItem('token');
    const vendorId = localStorage.getItem('vendor_id');
    const vendorRaw = localStorage.getItem('vendor');
    if (token && vendorId) {
      const vendor = vendorRaw ? JSON.parse(vendorRaw) : null;
      dispatch(setCredentials({ token, vendorId, vendor }));
    } else {
      dispatch(clearAuth());
    }
    setHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/vendor/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img
          src="https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png"
          alt="SpringUpAI"
          className="h-14 w-auto animate-pulse mix-blend-multiply dark:mix-blend-screen"
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
