import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from './logger';

const log = logger.child({ util: 'ArticleFetcher' });

const ARTICLE_SELECTORS = [
  'article',
  '[role="main"]',
  '.article-body',
  '.article-content',
  '.post-body',
  '.post-content',
  '.entry-content',
  '.story-body',
  '.page-content',
  'main',
];

const NOISE_SELECTORS = [
  'script',
  'style',
  'nav',
  'header',
  'footer',
  'aside',
  'figure',
  '.advertisement',
  '.ads',
  '.ad',
  '.sidebar',
  '.comments',
  '.related',
  '.social-share',
  '.newsletter',
  '.subscription',
  '.paywall',
];

/**
 * Fetches a URL and extracts the main article text content.
 * Returns null if the fetch fails or content cannot be extracted.
 */
export async function fetchArticleContent(url: string, maxChars = 4000): Promise<string | null> {
  try {
    const response = await axios.get<string>(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 10_000,
      maxContentLength: 2_000_000,
    });

    const $ = cheerio.load(response.data);

    NOISE_SELECTORS.forEach((sel) => $(sel).remove());

    for (const selector of ARTICLE_SELECTORS) {
      const el = $(selector).first();
      if (el.length) {
        const text = el.text().replace(/\s+/g, ' ').trim();
        if (text.length > 300) {
          log.debug({ url, selector, length: text.length }, 'Extracted article content');
          return text.slice(0, maxChars);
        }
      }
    }

    // Fallback: full body text
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 300) {
      log.debug({ url, length: bodyText.length }, 'Extracted body fallback content');
      return bodyText.slice(0, maxChars);
    }

    log.warn({ url }, 'Could not extract meaningful content from article');
    return null;
  } catch (err) {
    log.warn({ err, url }, 'Failed to fetch article content');
    return null;
  }
}
