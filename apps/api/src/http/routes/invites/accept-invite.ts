import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { roleSchema } from '@saas/auth';
import { BadRequestError } from '../_errors/bad-request-error';

export async function acceptInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/invites/:inviteId/accept',
      {
        schema: {
          tags: ['invites'],
          summary: 'Accept an invite by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({
            inviteId: z.string().min(1).max(255),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = request.getCurrentUserId();
        const { inviteId } = request.params;

        const invite = await prisma.invite.findUnique({
          where: { id: inviteId },
        });

        if (!invite) {
          throw new BadRequestError('Invite not found');
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        return reply.status(204).send(null);
      }
    );
}
