import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { prisma } from '@/lib/prisma';

export async function getOrganizationBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug/billing',
      {
        schema: {
          tags: ['billing'],
          summary: 'Get an organization billing by slug',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),

          response: {
            200: z.object({
              billing: z.object({
                seats: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                projects: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                total: z.number(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot('get', 'Billing')) {
          throw new UnauthorizedError(
            'You do not have permission to view the billing information for this organization.'
          );
        }

        const [ammountOfMembers, ammountOfProjects] = await Promise.all([
          prisma.member.count({
            where: {
              organizationId: organization.id,
              role: { not: 'BILLING' },
            },
          }),

          prisma.project.count({
            where: {
              organizationId: organization.id,
            },
          }),
        ]);

        return {
          billing: {
            seats: {
              amount: ammountOfMembers,
              unit: 10,
              price: ammountOfMembers * 10,
            },
            projects: {
              amount: ammountOfProjects,
              unit: 20,
              price: ammountOfProjects * 20,
            },
            total: ammountOfMembers * 10 + ammountOfProjects * 20,
          },
        };
      }
    );
}
