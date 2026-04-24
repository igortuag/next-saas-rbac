import { auth } from '@/http/middlewares/auth';
import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['auth'],
          summary: 'Get the authenticated user profile',
          reponse: {
            200: z.object({
              user: z.object({
                id: z.string(),
                email: z.string(),
                name: z.string().nullable(),
                avatarUrl: z.string().nullable(),
              }),
            }),
            401: z.object({
              error: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
          where: {
            id: userId,
          },
        });

        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }

        return reply.send({ user });
      }
    );
}
