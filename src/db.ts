import { orchidORM } from 'orchid-orm';

import { config } from '@/config';
import { UserTable } from '@/app/user/user.table';
import { UserFollowTable } from '@/app/user/user-follow.table';

export const db = orchidORM(
  {
    databaseURL: config.currentDBUrl,
    log: true,
  },
  {
    user: UserTable,
    user_follow: UserFollowTable,
  }
);
