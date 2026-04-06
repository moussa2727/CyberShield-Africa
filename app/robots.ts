import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/',
          '/admin/',
          '/admin/messages/',
          '/api/',
          '/messages/',
          '/_next/',
          '/static/',
          '/unauthorized',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/auth/', '/admin/', '/api/', '/messages/', '/_next/', '/unauthorized'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
