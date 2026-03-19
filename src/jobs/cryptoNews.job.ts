import { TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { getArticlesFromFeeds, markAsPosted } from '../services/news.service';
import { claudeService } from '../services/claude.service';
import { fetchArticleContent } from '../utils/article-fetcher';
import { createNewsEmbed } from '../utils/embed.builder';
import { CRYPTO_FEEDS } from '../data/rss-feeds';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ job: 'CryptoNewsJob' });

export async function runCryptoNewsJob(client: ExtendedClient): Promise<void> {
  if (!config.channels.cryptoNews) {
    log.warn('CRYPTO_NEWS_CHANNEL_ID not configured, skipping crypto news job');
    return;
  }

  const channel = client.channels.cache.get(config.channels.cryptoNews) as TextChannel | undefined;
  if (!channel) {
    log.warn({ channelId: config.channels.cryptoNews }, 'Crypto news channel not found in cache');
    return;
  }

  log.info('Running crypto news job');

  const articles = await getArticlesFromFeeds(CRYPTO_FEEDS, 1);

  if (articles.length === 0) {
    log.info('No new crypto articles found');
    return;
  }

  const article = articles[0];
  try {
    const content = await fetchArticleContent(article.url);
    const summary = await claudeService.summarizeArticle(article.title, article.url, content ?? article.summary);
    await channel.send({ embeds: [createNewsEmbed(article, summary)] });
  } catch (err) {
    log.error({ err, url: article.url }, 'Failed to post crypto article');
    return;
  }

  markAsPosted(articles);
  log.info('Crypto news job complete');
}
