import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { BadRequestError } from '../_errors/bad-request-error';

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug/invites/:inviteId',
      {
        schema: {
          tags: ['invites'],
          summary: 'Revoke an invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
            inviteId: z.string().min(1).max(255),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('delete', 'Invite')) {
          throw new UnauthorizedError(
            'You do not have permission to delete an invite in this organization'
          );
        }

        const { inviteId } = request.params;

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
          },
        });

        if (!invite) {
          throw new BadRequestError(
            `The invite with ID ${inviteId} does not exist in this organization.`
          );
        }

        await prisma.invite.delete({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        });

        reply.status(204).send(null);
      }
    );
}
