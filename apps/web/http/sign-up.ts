import { api } from './api-client';

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export type SignUpResponse = void

export async function SignUp({
  name,
  email,
  password,
}: SignUpRequest): Promise<SignUpResponse> {
  await api
    .post('sessions/password', {
      json: {
        name,
        email,
        password,
      },
    })
}
