import { routeHandler } from '@/lib/helpers/route-handler';
import { db } from '@/db';
import { encryptPassword, comparePassword } from '@/lib/helpers/bcrypt';
import { createToken } from '@/lib/helpers/jwt';
import { userSchema } from './user.table';
import { authDto } from './user.dto';
import { ApiError } from '@/lib/errors';
import { omit } from '@/lib/utils/omit';
import { getCurrentUserId } from '@/lib/helpers/get-user-id';

export const registerUser = routeHandler(
  {
    body: userSchema.pick({
      username: true,
      email: true,
      password: true,
    }),
    result: authDto,
  },
  async (req, reply) => {
    try {
      const hash = await encryptPassword(req.body.password);

      const user = await db.user.select('id', 'email', 'username').create({
        ...req.body,
        password: hash,
      });

      const token = createToken({ id: user.id });

      return reply.send({
        user,
        token,
      });
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
  async (req, reply) => {
    const user = await db.user
      .select('id', 'email', 'username', 'password')
      .findByOptional({
        email: req.body.email,
      });

    if (!user || !(await comparePassword(req.body.password, user.password))) {
      throw new ApiError(400, 'Email or password is invalid');
    }

    return reply.send({
      user: omit(user, 'password'),
      token: createToken({ id: user.id }),
    });
  }
);

export const followUserRoute = routeHandler(
  {
    params: userSchema.pick({
      username: true,
    }),
  },
  async (req, reply) => {
    const userId = getCurrentUserId(req);

    await db.user
      .findBy({
        username: req.params.username,
      })
      .follows.create({
        follower_id: userId,
      });

    return reply.send({
      message: `You are now following ${req.params.username}`,
    });
  }
);
