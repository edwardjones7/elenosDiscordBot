# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Hot-reload dev server (nodemon + tsx)
npm run build        # TypeScript compile → dist/
npm start            # Run compiled dist/index.js
npm run deploy       # Register slash commands to guild (requires GUILD_ID)
npm run deploy:global  # Register slash commands globally (production)
```

There is no test suite. TypeScript type-checking is the primary validation tool (`tsc --noEmit`).

## Architecture

### Startup Flow
`index.ts` validates env/config → initializes SQLite DB → creates Discord client → dynamically loads commands and events → `client.login()`. The `ready` event fires last and starts all cron jobs via `registerJobs()` in `src/jobs/index.ts`.

### Dynamic Loading Pattern
`src/handlers/command.handler.ts` recursively scans `src/commands/` and imports any `.ts`/`.js` file, registering its default export in `client.commands`. `src/handlers/event.handler.ts` similarly loads `src/events/`. Adding a new command or event file is sufficient — no manual registration needed.

### Command Interface
Every command must implement `Command` from `src/types/command.types.ts`:
```typescript
{
  data: SlashCommandBuilder,   // command definition
  category: CommandCategory,   // Agency | AI | News | Moderation | Utility
  cooldown?: number,           // seconds
  memberPermissions?: bigint[], // required user perms
  botPermissions?: bigint[],   // required bot perms
  execute(interaction, client): Promise<void>
}
```

### Service Layer
All external integrations live in `src/services/`. Commands and jobs call services; services never call each other except `news.service.ts` which orchestrates `rss.service.ts` and `newsapi.service.ts`.

- `claude.service.ts` — LLM calls via **Groq SDK** (model: `llama-3.3-70b-versatile`). Responses truncated to 1900 chars for Discord limits.
- `news.service.ts` — Deduplicates by URL across RSS + NewsAPI, marks posted articles in SQLite.
- `moderation.service.ts` — Pipeline: spam check → bad words → caps abuse. Returns on first violation.

### Scheduled Jobs
Three news jobs (tech/crypto/stock) and one weekly digest job. All registered in `src/jobs/index.ts`. Each news job: fetch one unposted article → AI-summarize to 3 bullets → post embed → mark as posted. Schedules are configurable via env vars (`NEWS_POST_INTERVAL`, `WEEKLY_DIGEST_SCHEDULE`).

### Database
better-sqlite3 (synchronous, WAL mode). Three tables: `warnings`, `posted_articles` (dedup by URL PK), `spam_records`. Initialized automatically at startup in `src/utils/database.ts`. DB path configurable via `DB_PATH` env var, defaults to `./data/elenos.db`.

## Non-Obvious Implementation Details

**Groq, not Anthropic:** Despite the service being named `claude.service.ts`, the bot uses `groq-sdk` with `GROQ_API_KEY`. The AI_MODEL env var controls which Groq model is used.

**bad-words require() quirk:** `moderation.service.ts` uses `require()` instead of ESM import because bad-words v4 doesn't export cleanly for ESM. This is intentional.

**DatabaseType annotation:** `src/utils/database.ts` explicitly annotates the export type to avoid TS4023 (inferred type cannot be named). Do not remove this annotation.

**Event handlers receive `client`:** The event loader appends `client` as the final argument to every event handler. Event handler signatures end with `client: ExtendedClient`.

**Pagination:** `src/utils/pagination.ts` creates button collectors with a 5-minute timeout. Buttons are disabled (not removed) on timeout. Collectors validate that only the original command invoker can navigate.

**Article freshness:** RSS articles older than 3 hours are filtered out (`NEWS_MAX_AGE_HOURS`, default: 3). The weekly digest looks back 7 days from `posted_articles`.

## Required Environment Variables

```
DISCORD_TOKEN      # Bot token
CLIENT_ID          # Discord application ID
GROQ_API_KEY       # LLM API key (Groq)
```

Optional: `GUILD_ID`, `TECH_NEWS_CHANNEL_ID`, `CRYPTO_NEWS_CHANNEL_ID`, `STOCK_NEWS_CHANNEL_ID`, `MOD_LOGS_CHANNEL_ID`, `WELCOME_CHANNEL_ID`, `NEWSAPI_KEY`, `AI_MODEL`, `AI_MAX_TOKENS`, `NEWS_POST_INTERVAL`, `WEEKLY_DIGEST_SCHEDULE`, `NODE_ENV`, `LOG_LEVEL`, `DB_PATH`, `MAX_WARNINGS`

## Embed Styling
Always use factory functions from `src/utils/embed.builder.ts` (`createSuccessEmbed`, `createErrorEmbed`, `createNewsEmbed`, etc.) rather than constructing embeds directly. These enforce consistent colors (defined in `src/config/constants.ts`) and the standard footer.
