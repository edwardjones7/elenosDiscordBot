import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { getLatestArticles } from '../../services/news.service';
import { createNewsEmbed, createInfoEmbed } from '../../utils/embed.builder';

export default {
  data: new SlashCommandBuilder()
    .setName('latestnews')
    .setDescription('Fetch the latest tech news'),
  category: CommandCategory.News,
  cooldown: 60,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const articles = await getLatestArticles(5);

    if (articles.length === 0) {
      await interaction.editReply({
        embeds: [createInfoEmbed('No New Articles', 'No new tech articles found in the last 3 hours. Check back soon!')],
      });
      return;
    }

    const embeds = articles.map((a) => createNewsEmbed(a));
    await interaction.editReply({ embeds });
  },
} satisfies Command;
