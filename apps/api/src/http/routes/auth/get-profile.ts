import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
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
      const payload = await request.jwtVerify<{ sub: string }>();

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({ user });
    }
  );
}
