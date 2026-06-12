import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { createSlug } from '@/utils/create-slug';

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            204: z.object(z.null()),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('delete', 'Project')) {
          throw new UnauthorizedError(
            'You do not have permission to delete a project in this organization'
          );
        }

        const project = await prisma.project.delete({
          where: {
            id: request.params.projectId,
            organizationId: organization.id,
          },
        });

        return reply.status(204).send(null);
      }
    );
}
