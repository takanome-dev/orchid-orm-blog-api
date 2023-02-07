import { z } from 'zod';
import { userSchema } from './user.table';

export const authDto = z.object({
  user: userSchema.pick({
    id: true,
    username: true,
    email: true,
  }),
  token: z.string(),
});

export type AuthDto = z.infer<typeof authDto>;
