import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ReduxProvider } from '@/components/redux-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://springupai.com'),
  title: {
    default: 'SpringUpAI - Fix, Pay, or Book Anything via WhatsApp in Nigeria',
    template: '%s | SpringUpAI',
  },
  description:
    'SpringUpAI handles home services, bill payments, and everyday tasks through WhatsApp. No apps needed. Just send a message.',
  generator: 'Next.js',
  applicationName: 'SpringUpAI',
  // Search Console ownership verification. Set GOOGLE_SITE_VERIFICATION in your
  // env to the token Google gives you (Search Console → HTML tag method).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    siteName: 'SpringUpAI',
    locale: 'en_NG',
    url: 'https://springupai.com',
    images: [
      {
        url: 'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
        width: 1200,
        height: 630,
        alt: 'SpringUpAI — Fix, Pay, or Book Anything via WhatsApp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
    ],
  },
  icons: {
    icon: [
      {
        url: 'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
        type: 'image/png',
      },
    ],
    apple: 'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
