import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { createSlug } from '@/utils/create-slug';

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organization/:slug/projects',
      {
        schema: {
          tags: ['projects'],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1).max(255),
            description: z.string().min(1).max(255),
          }),
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            201: z.object({
              projectId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);
        const { name, description } = request.body;

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('create', 'Project')) {
          throw new UnauthorizedError(
            'You do not have permission to create a project in this organization'
          );
        }

        const project = await prisma.project.create({
          data: {
            name,
            slug: createSlug(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
          },
        });

        return reply.status(201).send({
          projectId: project.id,
        });
      }
    );
}
