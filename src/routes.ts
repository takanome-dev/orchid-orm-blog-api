import type { FastifyInstance } from 'fastify';

import * as user from '@/app/user/user.controller';

export const routes = async (app: FastifyInstance) => {
  app.post('/users', user.registerUserRoute);
};
