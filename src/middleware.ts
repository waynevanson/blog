import { defineMiddleware } from 'astro:middleware';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import keystaticConfig from '../keystatic.config';

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

let keystaticHandler: ReturnType<typeof makeGenericAPIRouteHandler> | undefined;

function getKeystaticHandler() {
  keystaticHandler ??= makeGenericAPIRouteHandler(
    { config: keystaticConfig },
    { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' },
  );
  return keystaticHandler;
}

/**
 * Keystatic derives the GitHub OAuth `redirect_uri` from the incoming request
 * origin. The site is served by a reverse proxy from 127.0.0.1:<port>, and
 * Astro only trusts `X-Forwarded-*` headers from hosts listed in
 * `security.allowedDomains`. If those headers are missing, Astro falls back to
 * `http://localhost:<port>` and GitHub rejects the sign-in because that is not
 * the app's registered callback URL.
 *
 * Intercept the login request in production and hand Keystatic a request built
 * from the configured public origin, so the callback URL is always canonical.
 * Local development is left alone so it keeps the localhost callback.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { request, site, url } = context;
  const pathname = url.pathname.replace(/\/+$/, '');

  if (
    import.meta.env.PROD &&
    site &&
    pathname === '/api/keystatic/github/login' &&
    LOOPBACK_HOSTNAMES.has(url.hostname)
  ) {
    const canonicalUrl = new URL(url.pathname + url.search, site);
    const { body, headers, status } = await getKeystaticHandler()(
      new Request(canonicalUrl, request),
    );
    return new Response(body as BodyInit, { status, headers });
  }

  return next();
});
