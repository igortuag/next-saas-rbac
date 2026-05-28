import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { auth } from '@/http/middlewares/auth';
import { prisma } from '@/lib/prisma';
import { roleSchema } from '@saas/auth';

export async function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get all organizations the user belongs to',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),

          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  domain: z.string().nullable(),
                  slug: z.string(),
                  shouldAttachUserByDomain: z.boolean().nullable(),
                  avatarUrl: z.string().nullable(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  ownerId: z.string(),
                  role: roleSchema.nullable(),
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = request.getCurrentUserId();

        const organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            domain: true,
            slug: true,
            shouldAttachUserByDomain: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            members: {
              select: {
                role: true,
              },
              where: {
                userId,
              },
            },
          },
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
        });

        const organizationsWithRoles = organizations.map(
          ({ members, ...org }) => {
            return {
              ...org,
              role: members[0]?.role,
            };
          }
        );

        return {
          organizations: organizationsWithRoles,
        };
      }
    );
}
