import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { BadRequestError } from './routes/_errors/bad-request-error';
import { UnauthorizedError } from './routes/_errors/unauthorized-error copy';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = async (
  error,
  request,
  reply
) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.issues,
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: 'Internal Server Error',
  });
};
