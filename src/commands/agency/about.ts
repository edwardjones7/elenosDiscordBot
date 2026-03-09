import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Learn about Elenos Software Agency'),
  category: CommandCategory.Agency,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.reply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('About Elenos')
          .setDescription(
            'Elenos is a software agency focused on building high-quality, scalable, and innovative digital products.\n\n' +
            'We partner with startups and enterprises to bring ambitious ideas to life — from sleek web apps to AI-powered systems.',
          )
          .addFields(
            { name: '🌐 Website', value: 'elenos.dev', inline: true },
            { name: '📍 Focus', value: 'Software Agency', inline: true },
            { name: '💡 Specialties', value: 'Web Apps • Mobile • AI Systems • APIs', inline: false },
          ),
      ],
    });
  },
} satisfies Command;
