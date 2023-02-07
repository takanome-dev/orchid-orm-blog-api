import { routeHandler } from '@/lib/routeHandler';
import { db } from '@/db';
import { encryptPassword, comparePassword } from '@/lib/password';
import { createToken } from '@/lib/jwt';
import { userSchema } from './user.table';
import { authDto } from './user.dto';
import { ApiError } from '@/lib/errors';
import { omit } from '@/lib/utils';

export const registerUser = routeHandler(
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

export const loginUser = routeHandler(
  {
    body: userSchema.pick({
      email: true,
      password: true,
    }),
    result: authDto,
  },
  async (req) => {
    const user = await db.user
      .select('id', 'email', 'username', 'password')
      .findByOptional({
        email: req.body.email,
      });

    if (!user || !(await comparePassword(req.body.password, user.password))) {
      throw new ApiError(400, 'Email or password is invalid');
    }

    return {
      user: omit(user, 'password'),
      token: createToken({ id: user.id }),
    };
  }
);
