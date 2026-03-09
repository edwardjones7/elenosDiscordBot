import Parser from 'rss-parser';
import { NewsArticle } from '../types';
import { logger } from '../utils/logger';

const parser = new Parser();
const log = logger.child({ service: 'RssService' });

export async function fetchFeed(name: string, url: string): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        summary: item.contentSnippet?.trim() ?? item.summary?.trim() ?? '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : new Date(),
        source: name,
        imageUrl: (item as Record<string, unknown>)['media:content']
          ? ((item as Record<string, unknown>)['media:content'] as { $: { url: string } }).$?.url
          : undefined,
      }));
  } catch (err) {
    log.warn({ err, url }, `Failed to fetch RSS feed: ${name}`);
    return [];
  }
}
