import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { BadRequestError } from '../_errors/bad-request-error';

export async function getPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/pending-invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get pending invites for the current user',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.array(
              z.object({
                id: z.string().min(1).max(255),
                email: z.email(),
                organizationId: z.string().min(1).max(255),
                role: z.string().min(1).max(255),
                createdAt: z.string().min(1).max(255),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const userId = request.getCurrentUserId();
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        const invites = await prisma.invite.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            organization: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          where: { email: user.email },
        });

        return reply.status(200).send(invites);
      }
    );
}
