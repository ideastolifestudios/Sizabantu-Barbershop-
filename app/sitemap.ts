import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://sizabantubarbershop.co.za', lastModified: new Date(), priority: 1 },
    { url: 'https://sizabantubarbershop.co.za/privacy', lastModified: new Date(), priority: 0.5 },
    { url: 'https://sizabantubarbershop.co.za/terms', lastModified: new Date(), priority: 0.5 },
  ];
}
