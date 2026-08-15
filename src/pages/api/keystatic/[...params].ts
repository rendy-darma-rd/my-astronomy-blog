export const prerender = false;

import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import type { APIRoute } from 'astro';
import config from '../../../../keystatic.config';

const handler = makeGenericAPIRouteHandler({ config });

// Decode standard base64 or base64url → UTF-8 string
function base64Decode(b64: string): string {
  const std = b64.replaceAll('-', '+').replaceAll('_', '/');
  const padded = std.padEnd(std.length + ((4 - (std.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (c) => c.codePointAt(0)!);
  return new TextDecoder().decode(bytes);
}

// Encode UTF-8 string → standard base64 (what Keystatic client sends)
function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return btoa(binary);
}

function injectUpdatedDate(content: string, date: string): string {
  if (!content.startsWith('---')) return content;

  // Split off the frontmatter block
  const closingIdx = content.indexOf('\n---', 3);
  if (closingIdx === -1) return content;
  const front = content.slice(0, closingIdx);
  const rest = content.slice(closingIdx);

  if (/^updatedDate:/m.test(front)) {
    return front.replace(/^updatedDate:.*$/m, `updatedDate: ${date}`) + rest;
  }
  if (/^pubDate:/m.test(front)) {
    return front.replace(/^(pubDate:.*)$/m, `$1\nupdatedDate: ${date}`) + rest;
  }
  return `${front}\nupdatedDate: ${date}` + rest;
}

export const ALL: APIRoute = async (context) => {
  if (new URL(context.request.url).pathname.includes('__probe__')) {
    return new Response('CUSTOM_ROUTE_IS_ACTIVE', { status: 200 });
  }
  let { request } = context;

  if (request.method === 'POST') {
    const url = new URL(request.url);
    const joined = url.pathname
      .replace(/^\/api\/keystatic\/?/, '')
      .split('/')
      .filter(Boolean)
      .join('/');

    if (joined === 'update') {
      try {
        const body = await request.json();
        const today = new Date().toISOString().split('T')[0];
        console.log('[keystatic-intercept] update hit, additions:', (body.additions ?? []).map((a: { path: string }) => a.path));

        const modifiedAdditions = (body.additions ?? []).map(
          (addition: { path: string; contents: string }) => {
            if (!addition.path.startsWith('src/content/artikel/')) return addition;
            const text = base64Decode(addition.contents);
            console.log('[keystatic-intercept] decoded content start:', JSON.stringify(text.slice(0, 120)));
            const updated = injectUpdatedDate(text, today);
            console.log('[keystatic-intercept] injected content start:', JSON.stringify(updated.slice(0, 120)));
            return { ...addition, contents: base64Encode(updated) };
          }
        );

        request = new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify({ ...body, additions: modifiedAdditions }),
        });
      } catch (err) {
        console.error('[keystatic-intercept] ERROR:', err);
      }
    }
  }

  const { body, headers, status } = await handler(request);
  return new Response(body as BodyInit, {
    status,
    headers: headers as HeadersInit,
  });
};
