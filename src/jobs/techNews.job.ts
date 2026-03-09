import { TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { getLatestArticles, markAsPosted } from '../services/news.service';
import { claudeService } from '../services/claude.service';
import { createNewsEmbed } from '../utils/embed.builder';
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

  const articles = await getLatestArticles(1);

  if (articles.length === 0) {
    log.info('No new articles found');
    return;
  }

  const article = articles[0];
  try {
    const summary = await claudeService.summarizeArticle(
      article.title,
      article.url,
      article.summary,
    );

    await channel.send({ embeds: [createNewsEmbed(article, summary)] });
  } catch (err) {
    log.error({ err, url: article.url }, 'Failed to post article');
    return;
  }

  markAsPosted(articles);
  log.info({ count: articles.length }, 'Tech news job complete');
}
