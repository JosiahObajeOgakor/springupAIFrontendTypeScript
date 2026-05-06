import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Signup',
  description: 'Join SpringUpAI as a verified service provider. Reach more customers through WhatsApp.',
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
