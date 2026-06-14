import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://springupai.com';
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Public legal pages — low priority but valid indexable content
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Vendor entry points — useful for branded search
    {
      url: `${baseUrl}/vendor/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/vendor/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    // NOTE: /vendor/dashboard, /chat, and /admin are intentionally excluded —
    // they are authenticated/private and must not be indexed.
  ];
}
