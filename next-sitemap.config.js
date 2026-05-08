/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://realyyyricha.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/dashboard', '/dashboard/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard'],
      },
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  transform: async (config, path) => {
    // Higher priority for recipes and protocols
    let priority = 0.7
    if (path === '/') priority = 1.0
    else if (path.startsWith('/recipes/') || path.startsWith('/protocols/')) priority = 0.9
    else if (['/recipes', '/protocols', '/anti-inflammatory-foods', '/about'].includes(path)) priority = 0.8

    return { loc: path, changefreq: config.changefreq, priority, lastmod: new Date().toISOString() }
  },
}
