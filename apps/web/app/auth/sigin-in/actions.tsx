'use server';

import { z } from 'zod';

import { signInWithPassword } from '@/http/sign-in-with-password';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function signInWithEmailAndPassword(_: unknown, data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data));

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;

    return {
      success: false,
      message: null,
      errors,
    };
  }

  const { email, password } = result.data;

  const { token } = await signInWithPassword({
    email: String(email),
    password: String(password),
  });

  return {
    success: true,
    message: null,
    token,
    errors: null,
  };
}
