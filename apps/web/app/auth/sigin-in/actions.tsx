'use server';

import { z } from 'zod';

import { signInWithPassword } from '@/http/sign-in-with-password';
import { HTTPError } from 'ky';
import { cookies } from 'next/headers';

const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function signInWithEmailAndPassword(data: FormData) {
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

  try {
    const { token } = await signInWithPassword({
      email: email,
      password: password,
    });

    (await cookies()).set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      message: null,
      token,
      errors: null,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json();
      return {
        success: false,
        message,
        errors: null,
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      errors: null,
    };
  }
}
