'use server';

import { z } from 'zod';

import { signInWithPassword } from '@/http/sign-in-with-password';

const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
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
