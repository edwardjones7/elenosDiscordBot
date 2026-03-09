import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { ExtendedClient } from '../types';
import { logger } from '../utils/logger';

const log = logger.child({ handler: 'CommandHandler' });

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getAllFiles(fullPath));
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

export async function loadCommands(client: ExtendedClient): Promise<void> {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = getAllFiles(commandsPath);

  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    const command = module.default ?? module.command;
    if (!command?.data || !command?.execute) {
      log.warn({ file }, 'Skipping invalid command file');
      continue;
    }
    client.commands.set(command.data.name, command);
    log.debug({ name: command.data.name }, 'Loaded command');
  }

  log.info({ count: client.commands.size }, 'Commands loaded');
}
