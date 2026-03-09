import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize an article by URL')
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

    const summary = await claudeService.summarizeArticle('Article', url, '');

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Article Summary')
          .setDescription(summary)
          .addFields({ name: 'URL', value: url }),
      ],
    });
  },
} satisfies Command;
