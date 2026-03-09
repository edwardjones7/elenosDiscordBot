import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Elenos Bot anything')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('Your question').setRequired(true).setMaxLength(500),
    ),
  category: CommandCategory.AI,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const question = interaction.options.getString('question', true);
    const response = await claudeService.generateResponse(question);

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Elenos AI')
          .addFields(
            { name: 'Question', value: question },
            { name: 'Answer', value: response },
          ),
      ],
    });
  },
} satisfies Command;
