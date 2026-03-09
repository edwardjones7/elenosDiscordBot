import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';
import { paginate } from '../../utils/pagination';

const SERVICES = [
  {
    name: '🌐 Web Development',
    description:
      'Full-stack web applications built with modern frameworks.\n' +
      '**Stack:** React, Next.js, Node.js, TypeScript\n' +
      '**Ideal for:** SaaS products, dashboards, marketing sites',
  },
  {
    name: '📱 Mobile Development',
    description:
      'Cross-platform mobile apps for iOS and Android.\n' +
      '**Stack:** React Native, Expo\n' +
      '**Ideal for:** Consumer apps, internal tools, MVPs',
  },
  {
    name: '🤖 AI & Automation',
    description:
      'Integrate AI into your product or automate business processes.\n' +
      '**Stack:** Claude API, OpenAI, LangChain, Python\n' +
      '**Ideal for:** Chatbots, content generation, data pipelines',
  },
  {
    name: '🔌 API & Backend Systems',
    description:
      'Scalable backend infrastructure and API design.\n' +
      '**Stack:** Node.js, PostgreSQL, Redis, AWS\n' +
      '**Ideal for:** High-traffic systems, microservices, integrations',
  },
];

export default {
  data: new SlashCommandBuilder()
    .setName('services')
    .setDescription('Browse Elenos services'),
  category: CommandCategory.Agency,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const pages = SERVICES.map((s) =>
      createBaseEmbed(BRAND_COLOR)
        .setTitle(s.name)
        .setDescription(s.description)
        .setFooter({ text: 'Elenos Software Agency • elenos.dev — Use /contact to get started' }),
    );

    await paginate(interaction, pages);
  },
} satisfies Command;
