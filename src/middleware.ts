import { defineMiddleware } from 'astro:middleware';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import config from '../keystatic.config';

const keystatic = makeGenericAPIRouteHandler({ config });

// --- Basic Auth for /keystatic ---

function getEnvVar(context: Parameters<typeof defineMiddleware>[0], key: string): string | undefined {
  // Cloudflare Workers: env vars come from locals.runtime.env
  // Dev: from import.meta.env
  const runtime = (context.locals as Record<string, unknown>)?.runtime as Record<string, unknown> | undefined;
  const cfEnv = runtime?.env as Record<string, string> | undefined;
  return cfEnv?.[key] ?? (import.meta.env[key] as string | undefined);
}

function isAuthorized(authHeader: string | null, validUser: string, validPass: string): boolean {
  if (!authHeader?.startsWith('Basic ')) return false;
  try {
    const decoded = atob(authHeader.slice(6));
    const sep = decoded.indexOf(':');
    if (sep < 0) return false;
    return decoded.slice(0, sep) === validUser && decoded.slice(sep + 1) === validPass;
  } catch {
    return false;
  }
}

// --- updatedDate injection ---

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

function injectUpdatedDate(content: string, date: string): string {
  if (!content.startsWith('---')) return content;
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

// --- Middleware ---

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Protect /keystatic (UI) and /api/keystatic (API) with Basic Auth
  if (path.startsWith('/keystatic') || path.startsWith('/api/keystatic')) {
    const validUser = getEnvVar(context, 'KEYSTATIC_USERNAME');
    const validPass = getEnvVar(context, 'KEYSTATIC_PASSWORD');

    if (validUser && validPass) {
      const authHeader = context.request.headers.get('Authorization');
      if (!isAuthorized(authHeader, validUser, validPass)) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Keystatic CMS", charset="UTF-8"' },
        });
      }
    }
  }

  // Inject updatedDate on article save (local dev only — GitHub mode handles commits differently)
  if (
    import.meta.env.DEV &&
    context.request.method === 'POST' &&
    path === '/api/keystatic/update'
  ) {
    try {
      const body = await context.request.json();
      const today = new Date().toISOString().split('T')[0];

      const modifiedAdditions = (body.additions ?? []).map(
        (addition: { path: string; contents: string }) => {
          if (!addition.path.startsWith('src/content/artikel/')) return addition;
          const text = base64Decode(addition.contents);
          const updated = injectUpdatedDate(text, today);
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
      // Fall through to normal handler on error
    }
  }

  return next();
});
