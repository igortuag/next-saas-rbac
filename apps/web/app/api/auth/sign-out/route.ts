import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  (await cookies()).delete('token');

  const redirectUrl = new URL('/auth/sign-in', request.url);

  return NextResponse.redirect(redirectUrl);
}
