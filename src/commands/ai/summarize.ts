import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize a URL or text with AI')
    .addStringOption((opt) =>
      opt.setName('input').setDescription('URL or text to summarize').setRequired(true).setMaxLength(1000),
    ),
  category: CommandCategory.AI,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const input = interaction.options.getString('input', true);
    const isUrl = /^https?:\/\//i.test(input);

    const summary = await claudeService.summarizeArticle(
      isUrl ? 'Article' : 'Text',
      isUrl ? input : '',
      isUrl ? '' : input,
    );

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Summary')
          .setDescription(summary)
          .addFields({ name: 'Input', value: input.slice(0, 100) + (input.length > 100 ? '...' : '') }),
      ],
    });
  },
} satisfies Command;
