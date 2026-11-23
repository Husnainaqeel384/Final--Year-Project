// robots.txt and sitemap.xml must contain absolute URLs, so they are generated
// at build time from VITE_SITE_URL instead of being kept as static files.

const PUBLIC_ROUTES = ['/', '/about', '/case-study', '/contact', '/privacy'];

export function seoFiles(siteUrl) {
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /app',
    'Disallow: /api',
    'Disallow: /feeds',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');

  const urls = PUBLIC_ROUTES.map(
    (route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc></url>`,
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return {
    name: 'budget-book-seo-files',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}
