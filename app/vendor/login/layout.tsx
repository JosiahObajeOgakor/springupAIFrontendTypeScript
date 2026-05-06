import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Login',
  description: 'Log in to your SpringUpAI vendor dashboard to manage service requests and payments.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
