'use server';

import { z } from 'zod';

import { HTTPError } from 'ky';
import { SignUp } from '@/http/sign-up';

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

export async function signUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data));

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;

    return {
      success: false,
      message: null,
      errors,
    };
  }

  const { email, password, name } = result.data;

  try {
    await SignUp({
      name: name,
      email: email,
      password: password,
    });
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
