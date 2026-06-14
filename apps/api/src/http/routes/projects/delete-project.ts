import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { projectSchema } from '@saas/auth';
import { BadRequestError } from '../_errors/bad-request-error';

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
            projectId: z.string().min(1).max(255),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        });

        if (!project) {
          throw new BadRequestError('Project not found');
        }

        const { cannot } = getUserPermissions(userId, membership?.role);
        const authProject = projectSchema.parse(project);

        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            'You do not have permission to delete a project in this organization'
          );
        }

        await prisma.project.delete({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        });

        return reply.status(204).send(null);
      }
    );
}
