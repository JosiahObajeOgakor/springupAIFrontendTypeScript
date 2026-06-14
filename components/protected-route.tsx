'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/authSlice';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (pathname.startsWith('/admin')) {
        router.replace('/admin/login');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, router, pathname]);

  if (!isAuthenticated) {
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
