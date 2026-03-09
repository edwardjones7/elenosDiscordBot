import { TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { getLatestArticles, markAsPosted } from '../services/news.service';
import { claudeService } from '../services/claude.service';
import { createNewsEmbed, createBaseEmbed } from '../utils/embed.builder';
import { BRAND_COLOR } from '../config/constants';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ job: 'TechNewsJob' });

export async function runTechNewsJob(client: ExtendedClient): Promise<void> {
  if (!config.channels.techNews) {
    log.warn('TECH_NEWS_CHANNEL_ID not configured, skipping tech news job');
    return;
  }

  const channel = client.channels.cache.get(config.channels.techNews) as TextChannel | undefined;
  if (!channel) {
    log.warn({ channelId: config.channels.techNews }, 'Tech news channel not found in cache');
    return;
  }

  log.info('Running tech news job');

  const articles = await getLatestArticles(5);

  if (articles.length === 0) {
    log.info('No new articles found');
    return;
  }

  // Header embed
  await channel.send({
    embeds: [
      createBaseEmbed(BRAND_COLOR)
        .setTitle('📰 Latest Tech News')
        .setDescription(`Here are **${articles.length}** fresh stories from around the tech world:`),
    ],
  });

  for (const article of articles) {
    try {
      const summary = await claudeService.summarizeArticle(
        article.title,
        article.url,
        article.summary,
      );

      await channel.send({ embeds: [createNewsEmbed(article, summary)] });

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      log.error({ err, url: article.url }, 'Failed to post article');
    }
  }

  markAsPosted(articles);
  log.info({ count: articles.length }, 'Tech news job complete');
}
