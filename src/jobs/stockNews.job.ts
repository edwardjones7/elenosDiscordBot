import { TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { getArticlesFromFeeds, markAsPosted } from '../services/news.service';
import { claudeService } from '../services/claude.service';
import { createNewsEmbed } from '../utils/embed.builder';
import { STOCK_FEEDS } from '../data/rss-feeds';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ job: 'StockNewsJob' });

export async function runStockNewsJob(client: ExtendedClient): Promise<void> {
  if (!config.channels.stockNews) {
    log.warn('STOCK_NEWS_CHANNEL_ID not configured, skipping stock news job');
    return;
  }

  const channel = client.channels.cache.get(config.channels.stockNews) as TextChannel | undefined;
  if (!channel) {
    log.warn({ channelId: config.channels.stockNews }, 'Stock news channel not found in cache');
    return;
  }

  log.info('Running stock news job');

  const articles = await getArticlesFromFeeds(STOCK_FEEDS, 1);

  if (articles.length === 0) {
    log.info('No new stock articles found');
    return;
  }

  const article = articles[0];
  try {
    const summary = await claudeService.summarizeArticle(article.title, article.url, article.summary);
    await channel.send({ embeds: [createNewsEmbed(article, summary)] });
  } catch (err) {
    log.error({ err, url: article.url }, 'Failed to post stock article');
    return;
  }

  markAsPosted(articles);
  log.info('Stock news job complete');
}
