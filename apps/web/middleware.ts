import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/org')) {
    const [_, orgSlug] = pathname.split('/');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(^(?!api|_next|favicon.ico).*)'],
};
