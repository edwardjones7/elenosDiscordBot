import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { fetchArticleContent } from '../../utils/article-fetcher';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Fetch and break down an article by URL')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('URL of the article to summarize').setRequired(true),
    ),
  category: CommandCategory.AI,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const url = interaction.options.getString('url', true);

    if (!/^https?:\/\//i.test(url)) {
      await interaction.editReply('Please provide a valid URL starting with `http://` or `https://`.');
      return;
    }

    const content = await fetchArticleContent(url);
    const breakdown = await claudeService.breakdownArticle('Article', url, content ?? '');

    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle('Article Breakdown')
      .setDescription(breakdown)
      .addFields({ name: 'Source', value: url });

    if (!content) {
      embed.setFooter({ text: 'Note: could not fetch full article content — breakdown based on URL only.' });
    }

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
