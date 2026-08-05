import { api } from './api-client';

export interface SignInWithPasswordRequest {
  email: string;
  password: string;
}

export interface SignInWithPasswordResponse {
  token: string;
}

export async function signInWithPassword({
  email,
  password,
}: SignInWithPasswordRequest): Promise<SignInWithPasswordResponse> {
  const response = await api
    .post('sessions/password', {
      json: {
        email,
        password,
      },
    })
    .json<SignInWithPasswordResponse>();


  return response
}
