import { api } from './api-client';

export interface GetOrganizationsResponse {
  organizations: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string;
  }[];
}

export async function getOrganizations(): Promise<GetOrganizationsResponse> {
  const response = await api
    .get('organizations')
    .json<GetOrganizationsResponse>();

  return response;
}
