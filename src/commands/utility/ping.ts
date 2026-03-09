import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createInfoEmbed } from '../../utils/embed.builder';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  category: CommandCategory.Utility,
  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    const latency = Date.now() - interaction.createdTimestamp;
    const wsLatency = client.ws.ping;

    await interaction.reply({
      embeds: [
        createInfoEmbed(
          'Pong!',
          `**Latency:** ${latency}ms\n**WebSocket:** ${wsLatency}ms`,
        ),
      ],
    });
  },
} satisfies Command;
