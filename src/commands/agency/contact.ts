import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('contact')
    .setDescription('Get in touch with Elenos'),
  category: CommandCategory.Agency,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.reply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('Contact Elenos')
          .setDescription('Ready to build something great? Reach out to us.')
          .addFields(
            { name: '🌐 Website', value: 'elenos.dev', inline: true },
            { name: '💬 Discord', value: 'You\'re already here!', inline: true },
          ),
      ],
    });
  },
} satisfies Command;
