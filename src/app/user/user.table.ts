import { UserFollowTable } from '@/app/user/user-follow.table';
import { tableToZod } from 'orchid-orm-schema-to-zod';

import { BaseTable } from '@/lib/baseTable';

export class UserTable extends BaseTable {
  table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    username: t.text().unique().max(20),
    email: t.text().unique().email(),
    password: t.text().min(8),
    ...t.timestamps(),
  }));
  relations = {
    follows: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'following_id',
    }),

    followings: this.hasMany(() => UserFollowTable, {
      primaryKey: 'id',
      foreignKey: 'follower_id',
    }),
  };
}

export const userSchema = tableToZod(UserTable);
