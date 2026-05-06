import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Dashboard',
  description: 'Manage your SpringUpAI service requests, track payments, and view customer feedback.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
