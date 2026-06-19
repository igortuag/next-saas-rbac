import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { projectSchema } from '@saas/auth';
import { BadRequestError } from '../_errors/bad-request-error';

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organization/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Update a project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1).max(255).optional(),
            description: z.string().max(500).optional(),
            avatarUrl: z.string().url().optional(),
          }),
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

        if (cannot('update', authProject)) {
          throw new UnauthorizedError(
            'You do not have permission to update a project in this organization'
          );
        }

        const { name, description, avatarUrl } = request.body;

        await prisma.project.update({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
          data: {
            name,
            description,
            avatarUrl,
          },
        });

        return reply.status(204).send(null);
      }
    );
}
