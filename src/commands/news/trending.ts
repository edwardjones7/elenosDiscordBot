import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createBaseEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
}

export default {
  data: new SlashCommandBuilder()
    .setName('trending')
    .setDescription('View top trending stories on Hacker News right now'),
  category: CommandCategory.News,
  cooldown: 30,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const { data: ids } = await axios.get<number[]>(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      { timeout: 8000 },
    );

    const top10 = ids.slice(0, 10);
    const items = await Promise.all(
      top10.map((id) =>
        axios
          .get<HNItem>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 })
          .then((r) => r.data),
      ),
    );

    const lines = items
      .filter((i) => i?.title)
      .map((i, idx) => `**${idx + 1}.** [${i.title}](${i.url ?? `https://news.ycombinator.com/item?id=${i.id}`}) — ⬆️ ${i.score}`)
      .join('\n');

    await interaction.editReply({
      embeds: [
        createBaseEmbed(BRAND_COLOR)
          .setTitle('🔥 Trending on Hacker News')
          .setDescription(lines),
      ],
    });
  },
} satisfies Command;
