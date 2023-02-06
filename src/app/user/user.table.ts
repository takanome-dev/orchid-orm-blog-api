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
}

export const userSchema = tableToZod(UserTable);
