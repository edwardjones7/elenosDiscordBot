import axios from 'axios';
import { config } from '../config';
import { NewsArticle } from '../types';
import { logger } from '../utils/logger';

const log = logger.child({ service: 'NewsApiService' });

interface NewsApiArticle {
  title: string;
  url: string;
  description: string | null;
  publishedAt: string;
  source: { name: string };
  urlToImage: string | null;
}

export async function fetchTopTech(): Promise<NewsArticle[]> {
  if (!config.news.apiKey) {
    log.debug('NewsAPI key not configured, skipping');
    return [];
  }

  try {
    const response = await axios.get<{ articles: NewsApiArticle[] }>(
      'https://newsapi.org/v2/top-headlines',
      {
        params: {
          category: 'technology',
          language: 'en',
          pageSize: 10,
          apiKey: config.news.apiKey,
        },
        timeout: 10_000,
      },
    );

    return response.data.articles
      .filter((a) => a.title && a.url && !a.title.includes('[Removed]'))
      .map((a) => ({
        title: a.title.trim(),
        url: a.url,
        summary: a.description?.trim() ?? '',
        publishedAt: new Date(a.publishedAt),
        source: a.source.name,
        imageUrl: a.urlToImage ?? undefined,
      }));
  } catch (err) {
    log.warn({ err }, 'NewsAPI fetch failed');
    return [];
  }
}
