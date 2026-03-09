import './config'; // validates env vars on startup
import './utils/database'; // initializes DB on startup
import { createClient } from './bot';
import { loadCommands } from './handlers/command.handler';
import { loadEvents } from './handlers/event.handler';
import { config } from './config';
import { logger } from './utils/logger';

const log = logger.child({ module: 'Main' });

async function main(): Promise<void> {
  const client = createClient();

  await loadCommands(client);
  await loadEvents(client);

  await client.login(config.discord.token);
  log.info('Bot is starting...');
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start bot');
  process.exit(1);
});
