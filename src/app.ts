import fastify from 'fastify';
import { ZodError } from 'zod';

import { config } from '@/config';
import { routes } from '@/routes';

export const app = fastify({ logger: config.logger });

app.register(routes);

app.setErrorHandler(function (error, request, reply) {
  // Log error
  this.log.error(error);

  if (error.statusCode) {
    reply.status(error.statusCode).send({
      error: error.message,
    });
  } else if (error instanceof ZodError) {
    reply.status(422).send({
      error: 'Validation failed',
      issues: error.issues,
    });
  } else {
    reply.status(500).send({
      error: 'Something went wrong',
    });
  }
});
