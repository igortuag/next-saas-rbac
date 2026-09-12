import ky from 'ky';

export const api = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        // You can modify the request here, e.g., add headers
        return request;
      },
    ],
  },
});
