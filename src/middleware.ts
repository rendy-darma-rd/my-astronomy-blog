import { defineMiddleware } from 'astro:middleware';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import config from '../keystatic.config';

const keystatic = makeGenericAPIRouteHandler({ config });

function base64Decode(b64: string): string {
  const std = b64.replaceAll('-', '+').replaceAll('_', '/');
  const padded = std.padEnd(std.length + ((4 - (std.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (c) => c.codePointAt(0)!);
  return new TextDecoder().decode(bytes);
}

function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCodePoint(byte);
  return btoa(binary);
}

function injectDates(content: string, date: string): string {
  if (!content.startsWith('---')) return content;
  const closingIdx = content.indexOf('\n---', 3);
  if (closingIdx === -1) return content;
  let front = content.slice(0, closingIdx);
  const rest = content.slice(closingIdx);

  // pubDate: inject only on first save (when absent or not a real date)
  if (!/^pubDate:\s*\d{4}-\d{2}-\d{2}/m.test(front)) {
    front = /^pubDate:/m.test(front)
      ? front.replace(/^pubDate:.*$/m, `pubDate: ${date}`)
      : `${front}\npubDate: ${date}`;
  }

  // updatedDate: always stamp to today
  if (/^updatedDate:/m.test(front)) {
    front = front.replace(/^updatedDate:.*$/m, `updatedDate: ${date}`);
  } else if (/^pubDate:/m.test(front)) {
    front = front.replace(/^(pubDate:.*)$/m, `$1\nupdatedDate: ${date}`);
  } else {
    front = `${front}\nupdatedDate: ${date}`;
  }

  return front + rest;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (context.request.method === 'POST' && url.pathname === '/api/keystatic/update') {
    try {
      const body = await context.request.json();
      const today = new Date().toISOString().split('T')[0];

      const modifiedAdditions = (body.additions ?? []).map(
        (addition: { path: string; contents: string }) => {
          if (!addition.path.startsWith('src/content/artikel/')) return addition;
          const text = base64Decode(addition.contents);
          const updated = injectDates(text, today);
          return { ...addition, contents: base64Encode(updated) };
        }
      );

      const modifiedRequest = new Request(context.request.url, {
        method: 'POST',
        headers: context.request.headers,
        body: JSON.stringify({ ...body, additions: modifiedAdditions }),
      });

      const { body: responseBody, headers, status } = await keystatic(modifiedRequest);
      return new Response(responseBody as BodyInit, {
        status,
        headers: headers as HeadersInit,
      });
    } catch {
      // On error fall through to normal handler
    }
  }

  return next();
});
