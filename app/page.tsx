import type { Metadata } from 'next';
import Homepage from './components/homepage';

export const metadata: Metadata = {
  title: 'SpringUpAI - Fix, Pay, or Book Anything via WhatsApp in Nigeria',
  description:
    'SpringUpAI handles home services, bill payments, and everyday tasks through WhatsApp. No apps needed. Just send a message and we take care of everything — plumbing, electricity, AC repair, and more.',
  keywords: [
    'WhatsApp assistant Nigeria',
    'pay bills WhatsApp',
    'home services Lagos',
    'plumber Nigeria',
    'AC repair Lagos',
    'electricity bill payment',
    'SpringUpAI',
    'book services WhatsApp',
  ],
  openGraph: {
    title: 'SpringUpAI - Fix, Pay, or Book Anything via WhatsApp',
    description:
      'Handle home services, bill payments, and everyday tasks through WhatsApp. No apps needed.',
    url: 'https://springupai.com',
    siteName: 'SpringUpAI',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpringUpAI - Fix, Pay, or Book Anything via WhatsApp',
    description:
      'Handle home services, bill payments, and everyday tasks through WhatsApp. No apps needed.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://springupai.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'SpringUpAI',
      url: 'https://springupai.com',
      description:
        'AI-powered WhatsApp assistant for home services, bill payments, and everyday tasks in Nigeria.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'WebSite',
      name: 'SpringUpAI',
      url: 'https://springupai.com',
    },
    {
      '@type': 'Service',
      name: 'SpringUpAI WhatsApp Assistant',
      provider: {
        '@type': 'Organization',
        name: 'SpringUpAI',
      },
      description:
        'Fix, pay, or book anything via WhatsApp. Home services, bill payments, and everyday tasks handled for you.',
      areaServed: {
        '@type': 'Country',
        name: 'Nigeria',
      },
      serviceType: ['Home Services', 'Bill Payments', 'Task Management'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does SpringUpAI work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Send a message or voice note on WhatsApp describing what you need. We find verified providers, handle everything, and you only pay when the work is done.',
          },
        },
        {
          '@type': 'Question',
          name: 'What services can I request?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can request home services (plumbing, AC repair, electrical), bill payments (electricity, airtime, data, cable TV), and everyday tasks.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my payment safe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Your money is held safely until the work is completed. You always approve before any payment is made.',
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Homepage />
    </>
  );
}
