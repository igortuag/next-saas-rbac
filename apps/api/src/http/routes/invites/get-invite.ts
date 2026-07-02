import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { roleSchema } from '@saas/auth';
import { BadRequestError } from '../_errors/bad-request-error';

export async function getInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/invites/:inviteId',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get an invite by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({
            inviteId: z.string().min(1).max(255),
          }),
          response: {
            200: z.object({
              id: z.string(),
              email: z.email(),
              role: roleSchema,
              createdAt: z.string(),
              author: z.object({
                id: z.string(),
                email: z.email(),
                avatarUrl: z.url().nullable(),
              }),
              organization: z.object({
                name: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { inviteId } = request.params;

        const invite = await prisma.invite.findUnique({
          where: { id: inviteId },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                email: true,
                avatarUrl: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!invite) {
          throw new BadRequestError('Invite not found');
        }

        return reply.status(200).send(invite);
      }
    );
}
