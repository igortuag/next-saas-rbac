import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { BadRequestError } from '../_errors/bad-request-error';

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
        reponse: {
          201: z.object({
            token: z.string(),
          }),
        },
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
        throw new BadRequestError('Invalid email or password');
      }

      if (userFromEamil.passwordHash === null) {
        throw new BadRequestError('Invalid email or password');
      }

      const isPasswordValid = await compare(
        password,
        userFromEamil.passwordHash
      );

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid email or password');
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEamil.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        }
      );

      return reply.status(201).send({
        token,
      });
    }
  );
}
