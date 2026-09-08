import { api } from './api-client';

export interface GetProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
}

export async function getProfile(): Promise<GetProfileResponse> {
  const response = await api.post('profile').json<GetProfileResponse>();

  return response;
}
