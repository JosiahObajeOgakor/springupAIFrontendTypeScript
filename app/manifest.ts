import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpringUpAI',
    short_name: 'SpringUpAI',
    description:
      'Fix, pay, or book anything via WhatsApp. Home services, bill payments, and everyday tasks handled for you in Nigeria.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a6b2a',
    icons: [
      {
        src: 'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://res.cloudinary.com/detpqzhnq/image/upload/v1778105093/ChatGPT_Image_May_6_2026_10_42_50_PM_nvfwu3.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
