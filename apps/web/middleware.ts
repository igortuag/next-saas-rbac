import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  if (pathname.startsWith('/org')) {
    const [_, orgSlug] = pathname.split('/');

    response.cookies.set('org', orgSlug);
  } else {
    response.cookies.delete('org');
  }

  return response;
}

export const config = {
  matcher: ['/(^(?!api|_next|favicon.ico).*)'],
};
