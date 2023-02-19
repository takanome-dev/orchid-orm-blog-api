import { change } from 'rake-db';

change(async (db) => {
  await db.createTable('user_follow', (t) => ({
    following_id: t.integer().foreignKey('user', 'id'),
    follower_id: t.integer().foreignKey('user', 'id'),
    ...t.primaryKey(['following_id', 'follower_id']),
  }));
});
