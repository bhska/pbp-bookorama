// proxy.ts
import { getToken } from 'next-auth/jwt';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest, _next: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const protectedPaths = ['/admin', '/app'];
  const matchesProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  if (pathname === '/login' && token) {
    if ((token.role as unknown) === 'ADMIN') {
      const url = new URL(`/admin`, request.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL(`/app`, request.url);
      return NextResponse.redirect(url);
    }
  }

  if (!token && matchesProtectedPath) {
    if (!token) {
      const url = new URL(`/login`, request.url);
      return NextResponse.redirect(url);
    }
  }

  if (token) {
    if (pathname.startsWith('/admin') && (token.role as unknown) !== 'ADMIN') {
      const url = new URL(`/forbidden`, request.url);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/app') && (token.role as unknown) !== 'CUSTOMER') {
      const url = new URL(`/forbidden`, request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
