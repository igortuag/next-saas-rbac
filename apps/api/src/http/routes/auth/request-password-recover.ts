import { auth } from '@/http/middlewares/auth';
import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['auth'],
        summary: 'Request password recovery',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userFromEmail) {
        return reply
          .status(201)
          .send({ message: 'Password recovery email sent' });
      }

      const { id: code } = await prisma.passwordRecoveryToken.create({
        data: {
          type: 'PASSWORD_RECOVERY',
          userId: userFromEmail.id,
        },
      });

      // Send email with the password recovery token here (not implemented)

      console.log(`Password recovery token for user ${email}: ${code}`);

      return reply
        .status(201)
        .send({ message: 'Password recovery email sent' });
    }
  );
}
