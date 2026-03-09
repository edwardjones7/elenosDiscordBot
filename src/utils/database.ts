import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { logger } from './logger';

const dbPath = path.resolve(config.app.dbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db: DatabaseType = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    moderatorId TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posted_articles (
    url TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    postedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS spam_records (
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    messageCount INTEGER NOT NULL DEFAULT 1,
    windowStart INTEGER NOT NULL,
    PRIMARY KEY (guildId, userId)
  );
`);

logger.info({ dbPath }, 'Database initialized');
