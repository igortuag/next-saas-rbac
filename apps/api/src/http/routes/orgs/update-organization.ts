import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { userSchema, organizationSchema, defineAbilitiesFor } from '@saas/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { domain } from 'node_modules/zod/v4/core/regexes.cjs';
import { BadRequestError } from '../_errors/bad-request-error';
import { generateSlug } from '@/lib/create-slug';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { getUserPermissions } from '@/utils/get-user-permissions';

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update an existing organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1).max(255),
            domain: z
              .string()
              .min(1)
              .max(255)
              .regex(domain, 'Invalid domain format'),
            shouldAttachUserByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(slug);

        const { name, domain, shouldAttachUserByDomain } = request.body;

        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You do not have permission to update this organization'
          );
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain,
              id: {
                not: organization.id,
              },
            },
          });

          if (organizationByDomain) {
            throw new BadRequestError(
              'Domain is already in use by another organization'
            );
          }
        }

        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUserByDomain,
          },
        });

        reply.status(204);
      }
    );
}
