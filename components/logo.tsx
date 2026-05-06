'use client';

import { useAppSelector } from '@/lib/store/hooks';

export function Logo({ className = 'h-16 w-auto' }: { className?: string }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const href = isAuthenticated ? '/vendor/dashboard' : '/';

  return (
    <a href={href} className="flex items-center gap-2">
      <img
        src="https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png"
        alt="SpringUpAI"
        className={className}
      />
    </a>
  );
}
