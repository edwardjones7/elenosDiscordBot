import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';
import { paginate } from '../../utils/pagination';

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  [CommandCategory.Agency]: '🏢 Agency',
  [CommandCategory.AI]: '🤖 AI',
  [CommandCategory.News]: '📰 News',
  [CommandCategory.Moderation]: '🛡️ Moderation',
  [CommandCategory.Utility]: '🔧 Utility',
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all commands'),
  category: CommandCategory.Utility,
  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const grouped = new Map<CommandCategory, Command[]>();
    for (const cmd of client.commands.values()) {
      if (!grouped.has(cmd.category)) grouped.set(cmd.category, []);
      grouped.get(cmd.category)!.push(cmd);
    }

    const pages = Array.from(grouped.entries()).map(([category, cmds]) => {
      const embed = createBaseEmbed(BRAND_COLOR)
        .setTitle(`${CATEGORY_LABELS[category]} Commands`);

      for (const cmd of cmds) {
        embed.addFields({ name: `/${cmd.data.name}`, value: cmd.data.description });
      }

      if (category === CommandCategory.AI) {
        embed.addFields({ name: '@Elenos Bot', value: 'Mention the bot with any question and it will respond using AI.' });
      }

      return embed;
    });

    await paginate(interaction, pages);
  },
} satisfies Command;
