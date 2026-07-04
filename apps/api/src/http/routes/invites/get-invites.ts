import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { roleSchema } from '@saas/auth';
import { BadRequestError } from '../_errors/bad-request-error';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';

export async function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get invites for an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            200: z.array(
              z.object({
                id: z.string(),
                email: z.email(),
                role: roleSchema,
                createdAt: z.string(),
                author: z.object({
                  id: z.string(),
                  email: z.email(),
                  avatarUrl: z.url().nullable(),
                }),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { membership } = await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('get', 'Invite')) {
          throw new UnauthorizedError(
            'You do not have permission to view invites in this organization'
          );
        }

        const invites = await prisma.invite.findMany({
          where: { organization: { slug } },
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (invites.length === 0) {
          throw new BadRequestError('No invites found for this organization');
        }

        return reply.status(200).send(invites);
      }
    );
}
