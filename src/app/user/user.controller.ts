import { routeHandler } from '@/lib/routeHandler';
import { db } from '@/db';
import { encryptPassword } from '@/lib/password';
import { createToken } from '@/lib/jwt';
import { userSchema } from './user.table';
import { authDto } from './user.dto';
import { ApiError } from '@/lib/errors';

export const registerUserRoute = routeHandler(
  {
    body: userSchema.pick({
      username: true,
      email: true,
      password: true,
    }),
    result: authDto,
  },
  async (req) => {
    try {
      const user = await db.user.select('id', 'email', 'username').create({
        ...req.body,
        password: await encryptPassword(req.body.password),
      });

      return {
        user,
        token: createToken({ id: user.id }),
      };
    } catch (err) {
      console.log({ err });
      if (err instanceof db.user.error && err.isUnique) {
        if (err.columns.username) {
          throw new ApiError('Username is already taken');
        }
        if (err.columns.email) {
          throw new ApiError('Email is already taken');
        }
      }
      throw err;
    }
  }
);
