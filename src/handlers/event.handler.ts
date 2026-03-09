import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { ExtendedClient } from '../types';
import { logger } from '../utils/logger';

const log = logger.child({ handler: 'EventHandler' });

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs
    .readdirSync(eventsPath)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of files) {
    const module = await import(pathToFileURL(path.join(eventsPath, file)).href);
    const event = module.default ?? module;
    if (!event?.name) {
      log.warn({ file }, 'Skipping invalid event file');
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
    }

    log.debug({ name: event.name }, 'Registered event');
  }
}
