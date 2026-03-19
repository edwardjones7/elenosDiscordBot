import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { claudeService } from '../../services/claude.service';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR, AI_COOLDOWN_SECONDS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('operator')
    .setDescription('Find out if your workflow is a good candidate for AI automation')
    .addStringOption((opt) =>
      opt
        .setName('workflow')
        .setDescription('Describe the workflow or process you want to automate')
        .setRequired(true),
    ),
  category: CommandCategory.AI,
  cooldown: AI_COOLDOWN_SECONDS,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const workflow = interaction.options.getString('workflow', true);
    const evaluation = await claudeService.evaluateOperator(workflow);

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Operator Evaluation')
          .setDescription(evaluation)
          .addFields({ name: 'Workflow', value: workflow.slice(0, 200) }),
      ],
    });
  },
} satisfies Command;
