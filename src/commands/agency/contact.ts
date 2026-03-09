import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('contact')
    .setDescription('Get in touch with Elenos Software Agency'),
  category: CommandCategory.Agency,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle('Contact Elenos Software Agency')
      .setURL('https://elenos.ai')
      .setDescription('Ready to build something great? Reach out to us through any of the channels below:')
      .addFields(
        { name: '🌐 Website', value: '[elenos.ai](https://elenos.ai)', inline: true },
        { name: '📧 Email', value: 'hello@elenos.ai', inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
