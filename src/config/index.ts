import dotenv from 'dotenv';
dotenv.config();

const required = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GROQ_API_KEY',
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN!,
    clientId: process.env.CLIENT_ID!,
    guildId: process.env.GUILD_ID,
  },
  channels: {
    techNews: process.env.TECH_NEWS_CHANNEL_ID,
    modLogs: process.env.MOD_LOGS_CHANNEL_ID,
    welcome: process.env.WELCOME_CHANNEL_ID,
  },
  anthropic: {
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.AI_MODEL ?? 'llama-3.3-70b-versatile',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? '1024', 10),
  },
  news: {
    apiKey: process.env.NEWSAPI_KEY,
    postInterval: process.env.NEWS_POST_INTERVAL ?? '0 */2 * * *',
    weeklyDigestSchedule: process.env.WEEKLY_DIGEST_SCHEDULE ?? '0 9 * * 1',
  },
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    logLevel: process.env.LOG_LEVEL ?? 'info',
    dbPath: process.env.DB_PATH ?? './data/elenos.db',
    maxWarnings: parseInt(process.env.MAX_WARNINGS ?? '3', 10),
  },
};
