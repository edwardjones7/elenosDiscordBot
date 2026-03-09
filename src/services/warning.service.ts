import { db } from '../utils/database';
import { Warning } from '../types';
import { config } from '../config';

const insertWarning = db.prepare(
  'INSERT INTO warnings (guildId, userId, moderatorId, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
);
const getWarnings = db.prepare('SELECT * FROM warnings WHERE guildId = ? AND userId = ? ORDER BY timestamp DESC');
const countWarnings = db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guildId = ? AND userId = ?');

export function addWarning(
  guildId: string,
  userId: string,
  moderatorId: string,
  reason: string,
): { warning: Warning; shouldBan: boolean } {
  const result = insertWarning.run(guildId, userId, moderatorId, reason, Date.now());
  const warning: Warning = {
    id: result.lastInsertRowid as number,
    guildId,
    userId,
    moderatorId,
    reason,
    timestamp: Date.now(),
  };

  const count = (countWarnings.get(guildId, userId) as { count: number }).count;

  return { warning, shouldBan: count >= config.app.maxWarnings };
}

export function getUserWarnings(guildId: string, userId: string): Warning[] {
  return getWarnings.all(guildId, userId) as Warning[];
}

export function getWarningCount(guildId: string, userId: string): number {
  return (countWarnings.get(guildId, userId) as { count: number }).count;
}
