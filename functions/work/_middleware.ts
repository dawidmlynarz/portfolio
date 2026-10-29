/**
 * Cloudflare Pages Function for /work/*: the password gate for protected case studies.
 *
 * The static /work/<slug> page of a protected case study is its locked state. The full page only
 * exists in this function's bundle (.generated/protected-pages.js, written on build), so it is
 * served only to visitors with a valid unlock cookie.
 *
 * - POST /work/<slug> with the right `password`: sets the cookie and redirects back (303).
 *   A wrong one returns the locked page in its error state (401).
 * - GET /work/<slug> with a valid cookie: the full case study, never cached.
 *
 * One password, CASE_STUDY_PASSWORD (a Cloudflare Pages secret), unlocks every protected case
 * study for 30 days. The cookie is signed with it, so changing the password locks everyone out.
 * Without the secret nothing unlocks.
 */
import pages from "../../.generated/protected-pages.js";

interface Env {
  CASE_STUDY_PASSWORD?: string;
  ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> };
}

interface Context {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

const COOKIE = "case_study_access";
const MAX_AGE = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

/** Static files skip the site's _headers when a function answers, so repeat them here. */
const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/** The protected slug a path points at (/work/<slug>, .html or trailing slash), if any. */
function protectedSlug(pathname: string) {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  const slug = /^\/work\/([^/]+?)(?:\.html)?\/?$/i.exec(path)?.[1]?.toLowerCase();
  return slug && Object.hasOwn(pages, slug) ? slug : undefined;
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

const hmacKey = (password: string) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

/** Compares two strings in constant time (by their SHA-256 digests). */
async function sameSecret(a: string, b: string) {
  const [x, y] = await Promise.all(
    [a, b].map(
      async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(s))),
    ),
  );
  let diff = 0;
  for (let i = 0; i < x!.length; i++) diff |= x![i]! ^ y![i]!;
  return diff === 0;
}

/** "<expiry>.<signature>": the expiry (seconds) signed with the password. */
async function createToken(password: string) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(password),
    encoder.encode(`unlock.${expires}`),
  );
  return `${expires}.${toBase64Url(signature)}`;
}

async function hasAccess(request: Request, password: string) {
  const cookie = request.headers.get("Cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  const [expires, signature] = token?.split(".") ?? [];
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(password),
      fromBase64Url(signature),
      encoder.encode(`unlock.${expires}`),
    );
  } catch {
    return false;
  }
}

/** The static locked page, switched to its "wrong password" state. */
async function lockedWithError(env: Env, url: URL, slug: string) {
  const locked = await env.ASSETS.fetch(new URL(`/work/${slug}`, url));
  const html = (await locked.text())
    .replace('data-lock-state="locked"', 'data-lock-state="error"')
    .replace(
      'data-lock-input="password"',
      'data-lock-input="password" aria-invalid="true" aria-describedby="lock-error" autofocus',
    );
  return new Response(html, { status: 401, headers: HTML_HEADERS });
}

export async function onRequest({ request, env, next }: Context) {
  const url = new URL(request.url);
  const slug = protectedSlug(url.pathname);
  if (!slug) return next();

  const password = env.CASE_STUDY_PASSWORD;

  if (request.method === "POST") {
    const form = await request.formData().catch(() => undefined);
    const attempt = form?.get("password");
    if (password && typeof attempt === "string" && (await sameSecret(attempt, password))) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/work/${slug}`,
          "Cache-Control": "no-store",
          "Set-Cookie": `${COOKIE}=${await createToken(password)}; Max-Age=${MAX_AGE}; Path=/work; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return lockedWithError(env, url, slug);
  }

  if (password && (await hasAccess(request, password))) {
    return new Response(pages[slug], { headers: HTML_HEADERS });
  }

  // The locked page. Never cached, so it can't stand in for the full page after unlocking.
  const response = await next();
  const locked = new Response(response.body, response);
  locked.headers.set("Cache-Control", "no-store");
  return locked;
}
