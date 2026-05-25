import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { auth } from '@/http/middlewares/auth';

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get an organization by slug',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string().min(1).max(255),
          }),

          response: {
            200: z.object({
              organization: z.object({
                id: z.string(),
                name: z.string(),
                domain: z.string().nullable(),
                slug: z.string(),
                shouldAttachUserByDomain: z.boolean().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const { organization } = await request.getUserMembership(slug);

        return {
          organization,
        };
      }
    );
}
