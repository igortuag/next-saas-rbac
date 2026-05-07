import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate a user with GitHub',
        body: z.object({
          code: z.string(),
        }),
        reponse: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body;

      const githubOAuthURL = new URL(
        'https://github.com/login/oauth/access_token'
      );

      if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        throw new Error('GitHub client ID or secret is not set');
      }

      githubOAuthURL.searchParams.set(
        'client_id',
        process.env.GITHUB_CLIENT_ID
      );
      githubOAuthURL.searchParams.set(
        'client_secret',
        process.env.GITHUB_CLIENT_SECRET
      );
      githubOAuthURL.searchParams.set('code', code);

      const response = await fetch(githubOAuthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      const githubAccessTokenData = await response.json();

      const { access_token } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData);

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const githubUserData = await githubUserResponse.json();

      const {
        id: githubId,
        name,
        email,
        avatar_url,
      } = z
        .object({
          id: z.number().transform(String),
          avatar_url: z.string(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .parse(githubUserData);

      if (!email) {
        throw new Error('GitHub user does not have an email');
      }

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl: avatar_url,
            githubId,
          },
        });
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'GITHUB',
            providerAccountId: githubId,
          },
        },
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GITHUB',
            providerAccountId: githubId,
            userId: user.id,
          },
        });
      }

     const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        }
      );

      return reply.status(201).send({
        token,
      });
    }
  );
}
