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
      const hash = await encryptPassword(req.body.password);

      const user = await db.user.select('id', 'email', 'username').create({
        ...req.body,
        password: hash,
      });

      const token = createToken({ id: user.id });

      return {
        user,
        token,
      };
    } catch (err) {
      if (err instanceof db.user.error) {
        if (err.constraint?.includes('user_username')) {
          throw new ApiError(400, 'Username is already taken');
        }
        if (err.constraint?.includes('user_email')) {
          throw new ApiError(400, 'Email is already taken');
        }
      }

      throw err;
    }
  }
);
