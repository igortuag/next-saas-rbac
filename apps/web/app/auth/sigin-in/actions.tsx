'use server';

import { api } from '@/http/api-client';

export async function signInWithEmailAndPassword(data: FormData) {
  const { email, password } = Object.fromEntries(data);

  const result = await api
    .post('sessions/password', {
      json: {
        email,
        password,
      },
    })
    .json();

  return result;
}
