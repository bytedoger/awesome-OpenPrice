import openNextWorker from './.open-next/worker.js';

export {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from './.open-next/worker.js';

const PUBLIC_HTML_ROUTES = [
  '/about',
  '/blog',
  '/card-products',
  '/channels',
  '/guide',
  '/official-prices',
];
const EDGE_CACHE_SECONDS = 300;

function isPublicHtmlPath(pathname) {
  if (pathname === '/') return true;
  return PUBLIC_HTML_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function hasAdminSession(request) {
  const cookie = request.headers.get('cookie') || '';
  return /(?:^|;\s*)(?:admin_session|admin_auth)=/i.test(cookie);
}

function isFullDocumentRequest(request) {
  const accept = request.headers.get('accept') || '';
  return (
    request.method === 'GET' &&
    accept.includes('text/html') &&
    !request.headers.has('rsc') &&
    !request.headers.has('next-action') &&
    !request.headers.has('next-router-state-tree') &&
    !request.headers.has('next-router-prefetch') &&
    request.headers.get('purpose') !== 'prefetch' &&
    request.headers.get('sec-purpose') !== 'prefetch'
  );
}

function cacheBypassReason(request, url) {
  if (!isFullDocumentRequest(request)) return 'non-document';
  if (!isPublicHtmlPath(url.pathname)) return 'private-route';
  if (url.search) return 'query-string';
  if (hasAdminSession(request)) return 'admin-session';
  return null;
}

function withCacheStatus(response, status) {
  const result = new Response(response.body, response);
  result.headers.set('x-openprice-edge-cache', status);
  return result;
}

function isCacheableHtml(response) {
  const contentType = response.headers.get('content-type') || '';
  const cacheControl = response.headers.get('cache-control') || '';
  return (
    response.status === 200 &&
    contentType.includes('text/html') &&
    !response.headers.has('set-cookie') &&
    !/(?:private|no-store)/i.test(cacheControl)
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const bypassReason = cacheBypassReason(request, url);
    if (bypassReason) {
      const response = await openNextWorker.fetch(request, env, ctx);
      return withCacheStatus(response, `BYPASS; reason=${bypassReason}`);
    }

    // Use a normalized key so incidental browser headers and cookies do not
    // fragment the public HTML cache. Requests with admin cookies never reach
    // this branch.
    const cacheKey = new Request(url.toString(), {
      method: 'GET',
      headers: { accept: 'text/html' },
    });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return withCacheStatus(cached, 'HIT');

    const response = await openNextWorker.fetch(request, env, ctx);
    if (!isCacheableHtml(response)) return withCacheStatus(response, 'BYPASS; reason=response');

    const cacheResponse = new Response(response.body, response);
    cacheResponse.headers.set(
      'Cache-Control',
      `public, s-maxage=${EDGE_CACHE_SECONDS}, stale-while-revalidate=60`,
    );
    cacheResponse.headers.delete('set-cookie');
    ctx.waitUntil(cache.put(cacheKey, cacheResponse.clone()));

    return withCacheStatus(cacheResponse, 'MISS');
  },
};
