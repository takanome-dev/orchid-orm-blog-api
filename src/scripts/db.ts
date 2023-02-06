import { rakeDb } from 'rake-db';
import { appCodeUpdater } from 'orchid-orm';

import { config } from '../config';

const options = [{ databaseURL: config.currentDBUrl }];

// when running in production we don't need to test the database
if (config.NODE_ENV !== 'production') {
  const url = config.currentDBUrl;
  if (!url) {
    throw new Error('DATABASE_URL_TEST env variable is missing');
  }
  options.push({ databaseURL: url });
}

// pass options and migrationPath to `rakeDb`
rakeDb(options, {
  migrationsPath: '../migrations',
  appCodeUpdater: appCodeUpdater({
    tablePath: (tableName) => `../app/tables/${tableName}.table.ts`,
    baseTablePath: '../lib/baseTable.ts',
    mainFilePath: '../db.ts',
  }),
});
