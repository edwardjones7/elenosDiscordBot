import { db } from '../utils/database';
import { fetchFeed } from './rss.service';
import { fetchTopTech } from './newsapi.service';
import { RSS_FEEDS } from '../data/rss-feeds';
import { NewsArticle } from '../types';
import { NEWS_FETCH_HOURS_BACK } from '../config/constants';
import { logger } from '../utils/logger';

const log = logger.child({ service: 'NewsService' });

const isPosted = db.prepare('SELECT 1 FROM posted_articles WHERE url = ?');
const insertPosted = db.prepare(
  'INSERT OR IGNORE INTO posted_articles (url, title, postedAt) VALUES (?, ?, ?)',
);
const getRecentPosted = db.prepare(
  'SELECT url, title FROM posted_articles WHERE postedAt >= ? ORDER BY postedAt DESC',
);

export async function getLatestArticles(limit = 5): Promise<NewsArticle[]> {
  const cutoff = new Date(Date.now() - NEWS_FETCH_HOURS_BACK * 60 * 60 * 1000);

  const rssResults = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(feed.name, feed.url)),
  );

  const newsApiResults = await fetchTopTech();

  const allArticles: NewsArticle[] = [];

  for (const result of rssResults) {
    if (result.status === 'fulfilled') allArticles.push(...result.value);
  }
  allArticles.push(...newsApiResults);

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allArticles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  // Filter to recent articles not yet posted
  const fresh = deduped
    .filter((a) => a.publishedAt >= cutoff)
    .filter((a) => !isPosted.get(a.url))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  log.info({ total: allArticles.length, fresh: fresh.length }, 'Articles fetched');

  return fresh.slice(0, limit);
}

export function markAsPosted(articles: NewsArticle[]): void {
  const insertMany = db.transaction((items: NewsArticle[]) => {
    for (const a of items) {
      insertPosted.run(a.url, a.title, Date.now());
    }
  });
  insertMany(articles);
}

export function getPostedSince(since: Date): Array<{ url: string; title: string }> {
  return getRecentPosted.all(since.getTime()) as Array<{ url: string; title: string }>;
}
