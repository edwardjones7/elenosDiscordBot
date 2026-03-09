import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID');
  process.exit(1);
}

const isGlobal = process.argv.includes('--global');

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

async function deploy(): Promise<void> {
  const commandsPath = path.join(__dirname, '..', 'src', 'commands');
  const files = getAllFiles(commandsPath);

  const commands: unknown[] = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    const command = mod.default ?? mod.command;
    if (command?.data) commands.push(command.data.toJSON());
  }

  const rest = new REST().setToken(token!);

  const route = isGlobal || !guildId
    ? Routes.applicationCommands(clientId!)
    : Routes.applicationGuildCommands(clientId!, guildId);

  console.log(`Deploying ${commands.length} commands ${isGlobal ? 'globally' : `to guild ${guildId}`}...`);
  await rest.put(route, { body: commands });
  console.log('Commands deployed successfully!');
}

deploy().catch(console.error);
