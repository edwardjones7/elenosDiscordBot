import { Message } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const _bw = require('bad-words');
const BadWordsCtor = (_bw.default ?? _bw.Filter ?? _bw) as { new(): { isProfane(text: string): boolean; addWords(...words: string[]): void } };
import { db } from '../utils/database';
import { CUSTOM_BAD_WORDS } from '../data/bad-words';
import { ModerationAction, ModerationResult } from '../types';
import { CAPS_ABUSE_MIN_LENGTH, CAPS_ABUSE_RATIO, SPAM_MESSAGE_LIMIT, SPAM_WINDOW_MS } from '../config/constants';

const filter = new BadWordsCtor();
if (CUSTOM_BAD_WORDS.length > 0) filter.addWords(...CUSTOM_BAD_WORDS);

const getSpam = db.prepare('SELECT messageCount, windowStart FROM spam_records WHERE guildId = ? AND userId = ?');
const upsertSpam = db.prepare(`
  INSERT INTO spam_records (guildId, userId, messageCount, windowStart) VALUES (?, ?, 1, ?)
  ON CONFLICT(guildId, userId) DO UPDATE SET
    messageCount = CASE WHEN windowStart + ${SPAM_WINDOW_MS} < excluded.windowStart THEN 1 ELSE messageCount + 1 END,
    windowStart = CASE WHEN windowStart + ${SPAM_WINDOW_MS} < excluded.windowStart THEN excluded.windowStart ELSE windowStart END
`);

export function checkSpam(userId: string, guildId: string): ModerationResult {
  const now = Date.now();
  upsertSpam.run(guildId, userId, now);

  const record = getSpam.get(guildId, userId) as { messageCount: number; windowStart: number } | undefined;
  if (!record) return { shouldAct: false };

  const inWindow = now - record.windowStart < SPAM_WINDOW_MS;
  if (inWindow && record.messageCount > SPAM_MESSAGE_LIMIT) {
    return { shouldAct: true, reason: 'Spam detected', severity: 'medium' };
  }

  return { shouldAct: false };
}

export function checkBadWords(content: string): ModerationResult {
  if (filter.isProfane(content)) {
    return { shouldAct: true, reason: 'Inappropriate language', severity: 'medium' };
  }
  return { shouldAct: false };
}

export function checkCapsAbuse(content: string): ModerationResult {
  if (content.length < CAPS_ABUSE_MIN_LENGTH) return { shouldAct: false };
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return { shouldAct: false };
  const upperRatio = (content.match(/[A-Z]/g) ?? []).length / letters.length;
  if (upperRatio >= CAPS_ABUSE_RATIO) {
    return { shouldAct: true, reason: 'Excessive caps usage', severity: 'low' };
  }
  return { shouldAct: false };
}

export async function runPipeline(message: Message): Promise<ModerationAction | null> {
  if (message.author.bot || !message.guildId) return null;

  const checks = [
    checkSpam(message.author.id, message.guildId),
    checkBadWords(message.content),
    checkCapsAbuse(message.content),
  ];

  const violation = checks.find((c) => c.shouldAct);
  if (!violation) return null;

  return {
    reason: violation.reason!,
    severity: violation.severity!,
  };
}
