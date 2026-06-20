import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { getUserPermissions } from '@/utils/get-user-permissions';
import { UnauthorizedError } from '../_errors/unauthorized-error copy';
import { BadRequestError } from '../_errors/bad-request-error';

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                  role: z.enum(['owner', 'admin', 'member']),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership?.role);

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(
            'You do not have permission to view organization members'
          );
        }

        const members = await prisma.member.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        });

        const membersWitheRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => ({
            ...user,
            ...member,
            userId,
          })
        );

        return reply.status(200).send({
          membersWitheRoles,
        });
      }
    );
}
