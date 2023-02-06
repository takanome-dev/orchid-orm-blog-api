import { BaseTable } from '../../lib/baseTable';

export class UserTable extends BaseTable {
  table = 'user';
  columns = this.setColumns((t) => ({
    id: t.serial().primaryKey(),
    username: t.text().unique(),
    email: t.text().unique(),
    password: t.text(),
    ...t.timestamps(),
  }));
}
