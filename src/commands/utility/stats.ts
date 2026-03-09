import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot statistics'),
  category: CommandCategory.Utility,
  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    const mem = process.memoryUsage();

    await interaction.reply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Elenos Bot Stats')
          .addFields(
            { name: 'Uptime', value: formatUptime(client.uptime ?? 0), inline: true },
            { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Commands', value: `${client.commands.size}`, inline: true },
            { name: 'Memory', value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
            { name: 'Node.js', value: process.version, inline: true },
          ),
      ],
    });
  },
} satisfies Command;
