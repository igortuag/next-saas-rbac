import { signInWithGithub } from '@/http/sign-in-with-github';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  const code = searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const { token } = await signInWithGithub({ code });

  (await cookies()).set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day in seconds
  });

  const redirectUrl = new URL('/', request.url);

  return NextResponse.redirect(redirectUrl);
}
