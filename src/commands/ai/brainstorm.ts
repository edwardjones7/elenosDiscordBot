import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('brainstorm')
    .setDescription('Generate ideas with AI')
    .addStringOption((opt) =>
      opt.setName('topic').setDescription('What to brainstorm about').setRequired(true).setMaxLength(200),
    ),
  category: CommandCategory.AI,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const topic = interaction.options.getString('topic', true);
    const ideas = await claudeService.brainstorm(topic);

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle(`💡 Brainstorm: ${topic.slice(0, 50)}`)
          .setDescription(ideas),
      ],
    });
  },
} satisfies Command;
