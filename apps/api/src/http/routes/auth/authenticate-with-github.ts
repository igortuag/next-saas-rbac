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

      console.log(githubUserResponse);
    }
  );
}
