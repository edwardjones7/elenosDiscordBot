import { ActivityType, Events } from 'discord.js';
import { ExtendedClient } from '../types';
import { registerJobs } from '../jobs';
import { logger } from '../utils/logger';

const log = logger.child({ event: 'ready' });

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: ExtendedClient): void {
    log.info(`Logged in as ${client.user?.tag} | ${client.guilds.cache.size} guild(s)`);

    client.user?.setActivity('elenos.ai | /help', { type: ActivityType.Watching });

    registerJobs(client);
  },
};
