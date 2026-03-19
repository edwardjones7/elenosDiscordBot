import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask anything about Elenos AI')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('Your question about Elenos').setRequired(true),
    ),
  category: CommandCategory.Agency,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const question = interaction.options.getString('question', true);
    const answer = await claudeService.answerAboutElenos(question);

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Elenos AI')
          .setDescription(answer),
      ],
    });
  },
} satisfies Command;
