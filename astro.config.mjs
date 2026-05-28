// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Always include these integrations
const integrations = [
  mdx(), 
  sitemap(), 
  react(), 
  markdoc({ allowHTML: true }),
  keystatic() // Now enabled in both dev and production
];

export default defineConfig({
  site: 'https://example.com',
  adapter: cloudflare(),
  integrations,
  output: 'static',
});
