// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Only include Keystatic in development
const integrations = [
  mdx(), 
  sitemap(), 
  react({
    include: ['**/react/*', '**/keystatic/*', '**/node_modules/@keystatic/**'],
  }), 
  markdoc({ allowHTML: true })
];

if (process.env.NODE_ENV !== 'production') {
  integrations.push(keystatic());
}

export default defineConfig({
  site: 'https://example.com',
  adapter: cloudflare(),
  integrations,
  output: 'server',
  devToolbar: {
    enabled: false
  },
});
