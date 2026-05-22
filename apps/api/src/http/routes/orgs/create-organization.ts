import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { domain } from 'node_modules/zod/v4/core/regexes.cjs';
import { BadRequestError } from '../_errors/bad-request-error';
import { generateSlug } from '@/lib/create-slug';

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Create a new organization',
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
          response: {
            201: z.object({
              organizationId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { name, domain, shouldAttachUserByDomain } = request.body;

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

        const organization = await prisma.organization.create({
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
          organizationId: organization.id,
        });
      }
    );
}
