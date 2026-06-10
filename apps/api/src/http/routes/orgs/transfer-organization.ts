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

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organization/:slug/owner',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Transfer an existing organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.string().min(1).max(255),
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

        const { transferToUserId } = request.body;

        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorizedError(
            'You do not have permission to transfer ownership of this organization'
          );
        }

        const transferToMembership = await prisma.membership.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        });

        if (!transferToMembership) {
          throw new BadRequestError(
            'The user you are trying to transfer ownership to is not a member of this organization'
          );
        }

        await prisma.$transaction([
          prisma.membership.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),

          prisma.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ]);

        reply.status(204);
      }
    );
}
