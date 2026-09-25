'use server';

import { success, z } from 'zod';

import { SignInWithPasswordRequest } from '@/http/sign-in-with-password';
import { HTTPError } from 'ky';
import { cookies } from 'next/headers';

const signUpSchema = z
  .object({
    name: z
      .string()
      .refine((value) => value.split(' ').filter(Boolean).length > 0, {
        message: 'Please enter your full name',
      }),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function signUpWithEmailAndPassword(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data));

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
    const { token } = await signUpWithPassword({
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
