'use server';

import { signInWithPassword } from '@/http/sign-in-with-password';

export async function signInWithEmailAndPassword(
  previousState: any,
  data: FormData
) {
  const { email, password } = Object.fromEntries(data);

  const result = await signInWithPassword({
    email: String(email),
    password: String(password),
  });

  return result;
}
