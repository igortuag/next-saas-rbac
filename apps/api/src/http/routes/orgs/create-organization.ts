import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { domain } from 'node_modules/zod/v4/core/regexes.cjs';

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
            shouldAttachUserByDomain: z.boolean().nullish(),
          }),
        },
      },
      (request, reply) => {}
    );
}
