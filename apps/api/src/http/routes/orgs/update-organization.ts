import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { domain } from 'node_modules/zod/v4/core/regexes.cjs';
import { BadRequestError } from '../_errors/bad-request-error';
import { generateSlug } from '@/lib/create-slug';

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update an existing organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1).max(255),
            domain: z
              .string()
              .min(1)
              .max(255)
              .regex(domain, 'Invalid domain format'),
            shouldAttachUserByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string().min(1).max(255),
          }),
          response: {
            201: z.object({
              organizationId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(slug);

        const { name, domain, shouldAttachUserByDomain } = request.body;

        if (!membership || membership.role !== 'ADMIN') {
          throw new BadRequestError(
            'You do not have permission to update this organization'
          );
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findUnique({
            where: { domain },
          });

          if (organizationByDomain) {
            throw new BadRequestError(
              'Domain is already in use by another organization'
            );
          }
        }

        const updatedOrganization = await prisma.organization.update({
          where: { slug },
          data: {
            name,
            domain,
            slug: generateSlug(name),
            shouldAttachUserByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        });

        reply.status(201).send({
          organizationId: updatedOrganization.id,
        });
      }
    );
}
