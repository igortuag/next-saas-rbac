'use server';

import { redirect } from 'next/navigation';

export function signInWithGithub() {
  const githubSignInURL = new URL('https://github.com/login/oauth/authorize');
  githubSignInURL.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
  githubSignInURL.searchParams.set('scope', 'read:user user:email');

  redirect(githubSignInURL.toString());
}
