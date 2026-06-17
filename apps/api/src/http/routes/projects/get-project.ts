import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { BadRequestError } from '../_errors/bad-request-error';

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get a project by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string().min(1).max(255),
            projectSlug: z.string().min(1).max(255),
          }),
          response: {
            200: z.object({
              project: z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                slug: z.string(),
                ownerId: z.string(),
                avatarUrl: z.string().nullable(),
                createdAt: z.string(),
                updatedAt: z.string(),
                owner: z.object({
                  id: z.string(),
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(orgSlug);

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            'You do not have permission to view projects in this organization'
          );
        }

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        if (!project) {
          throw new BadRequestError('Project not found');
        }

        return reply.status(200).send({
          project,
        });
      }
    );
}
