import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  const isAuthPage =
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/verify');

  // 🔁 If logged in and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🔒 If NOT logged in and trying to access a protected route, redirect to sign-in
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // ✅ Allow all other cases through
  return NextResponse.next();
}

// ✅ Match only the routes you care about
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/verify/:path*',
    '/dashboard/:path*'
  ]
};
