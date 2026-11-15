import { api } from './api-client';

export interface GetMembershipResponse {
  membership: {
    id: string;
    role: 'ADMIN' | 'MEMBER' | 'BILLING';
    organizationId: string;
  };
}

export async function getMembership(
  org: string
): Promise<GetMembershipResponse> {
  const response = await api
    .get(`organizations/${org}/membership`)
    .json<GetMembershipResponse>();

  return response;
}
