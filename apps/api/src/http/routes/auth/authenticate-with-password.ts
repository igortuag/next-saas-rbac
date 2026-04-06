import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate a user with email and password',
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEamil = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userFromEamil) {
        return reply.status(400).send({
          message: 'Invalid email or password',
        });
      }

      if (userFromEamil.passwordHash === null) {
        return reply.status(400).send({
          message:
            'User does not have a password set, please use another authentication method',
        });
      }

      const isPasswordValid = await compare(
        password,
        userFromEamil.passwordHash
      );

      if (!isPasswordValid) {
        return reply.status(400).send({
          message: 'Invalid email or password',
        });
      }

      return 'Logged in successfully';
    }
  );
}
