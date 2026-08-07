import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/admin-session';

// OpenNext Cloudflare does not yet support Next.js Node Middleware (proxy.ts).
// Keep this Edge Middleware entry point until the adapter adds support.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!(await verifyAdminSession(session))) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
