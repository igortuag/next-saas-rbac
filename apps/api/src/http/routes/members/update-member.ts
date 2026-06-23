import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { BadRequestError } from '../_errors/bad-request-error';
import { roleSchema } from '@saas/auth';

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organization/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a member in the organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
            memberId: z.string().min(1).max(255),
          }),
          body: z.object({
            role: roleSchema,
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

        if (cannot('update', 'User')) {
          throw new UnauthorizedError(
            'You do not have permission to update organization members'
          );
        }

        const { role } = request.body;

        const member = await prisma.member.update({
          where: {
            id: request.params.memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        });

        reply.status(204).send(null);
      }
    );
}
