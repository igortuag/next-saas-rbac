'use server';

import ky from 'ky';

const api = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
});

export async function signInWithEmailAndPassword(data: FormData) {
  const { email, password } = Object.fromEntries(data);

  const result = await api.post('sessions/password', {
    json: {
      email,
      password,
    },
  });

  return result.json();
}
