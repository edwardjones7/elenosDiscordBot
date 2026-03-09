import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { ExtendedClient } from './types';

export function createClient(): ExtendedClient {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
  }) as ExtendedClient;

  client.commands = new Collection();
  client.cooldowns = new Collection();

  return client;
}
