import { orchidORM } from 'orchid-orm';

import { config } from '@/config';
import { UserTable } from '@/app/user/user.table';

export const db = orchidORM(
  {
    databaseURL: config.currentDBUrl,
    log: true,
  },
  {
    user: UserTable,
    // tables will be listed here
  }
);
