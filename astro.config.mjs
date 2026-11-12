// @ts-check
import node from '@astrojs/node';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import { defineConfig } from 'astro/config';

// Everything is rendered on demand from the checkout in BLOG_REPO_PATH so that
// content published through Keystatic shows up without a rebuild.
export default defineConfig({
  site: 'https://blog.waynevanson.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), keystatic()],
  security: {
    // Trust the home server's reverse proxy, so OAuth callbacks and absolute
    // URLs are built with the public HTTPS origin rather than localhost.
    allowedDomains: [{ hostname: 'blog.waynevanson.com', protocol: 'https' }],
  },
  vite: {
    server: {
      // Keystatic's GitHub OAuth callback needs a stable origin. The integration
      // defaults to 127.0.0.1, which is also what the tunnel/dev setup expects.
      allowedHosts: true,
    },
  },
});
