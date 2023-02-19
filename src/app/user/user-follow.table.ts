import { UserTable } from '@/app/user/user.table';
import { BaseTable } from '@/lib/baseTable';

export class UserFollowTable extends BaseTable {
  table = 'user_follow';
  columns = this.setColumns((t) => ({
    following_id: t.integer().foreignKey(() => UserTable, 'id'),
    follower_id: t.integer().foreignKey(() => UserTable, 'id'),
    ...t.primaryKey(['following_id', 'follower_id']),
  }));
}
