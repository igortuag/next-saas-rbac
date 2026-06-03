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

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Shutdown an existing organization',
          security: [{ bearerAuth: [] }],
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

        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            'You do not have permission to shutdown this organization'
          );
        }

        await prisma.organization.delete({
          where: {
            id: organization.id,
          },
        });

        reply.status(204);
      }
    );
}
