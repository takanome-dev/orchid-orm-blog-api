import type { FastifyInstance } from 'fastify';

import * as user from '@/app/user/user.controller';

export const routes = async (app: FastifyInstance) => {
  app.post('/users', user.registerUser);
  app.post('/users/auth', user.loginUser);
  app.post('/users/:username/follow', user.followUserRoute);
};
