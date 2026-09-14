import { getCookie } from 'cookies-next';
import ky from 'ky';

export const api = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { cookies: serverCookies } = await import('next/headers');

        const token = getCookie('token', { cookies: serverCookies });
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        } else {
          const token = getCookie('token');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      },
    ],
  },
});
