import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('services')
    .setDescription('See what Elenos Software Agency offers'),
  category: CommandCategory.Agency,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle('Elenos Software Agency — Services')
      .setURL('https://elenos.ai')
      .setDescription('We build high-quality software tailored to your business. Here\'s what we offer:')
      .addFields(
        { name: '🌐 Web Development', value: 'Custom web apps, dashboards, and SaaS platforms built to scale.', inline: false },
        { name: '📱 Mobile Apps', value: 'iOS and Android apps with smooth UX and modern architecture.', inline: false },
        { name: '🤖 AI Integration', value: 'LLM-powered features, automation pipelines, and intelligent systems.', inline: false },
        { name: '🛠️ API & Backend', value: 'Robust REST/GraphQL APIs, microservices, and cloud infrastructure.', inline: false },
        { name: '🎨 UI/UX Design', value: 'Clean, conversion-focused designs that users actually enjoy.', inline: false },
      )
      .addFields({ name: 'Get Started', value: 'Visit [elenos.ai](https://elenos.ai) or use `/contact` to reach us.' });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
