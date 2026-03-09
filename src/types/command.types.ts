import { ChatInputCommandInteraction, Client, Collection, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export enum CommandCategory {
  Agency = 'agency',
  AI = 'ai',
  News = 'news',
  Moderation = 'moderation',
  Utility = 'utility',
}

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  category: CommandCategory;
  cooldown?: number;
  memberPermissions?: bigint[];
  botPermissions?: bigint[];
  execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
}
