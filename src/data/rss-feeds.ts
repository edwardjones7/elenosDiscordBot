export interface RssFeed {
  name: string;
  url: string;
}

export const RSS_FEEDS: RssFeed[] = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Hacker News Best', url: 'https://hnrss.org/best' },
  { name: 'Dev.to', url: 'https://dev.to/feed' },
];

export const CRYPTO_FEEDS: RssFeed[] = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml' },
];

export const STOCK_FEEDS: RssFeed[] = [
  { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
  { name: 'Seeking Alpha', url: 'https://seekingalpha.com/market_currents.xml' },
  { name: 'Investopedia', url: 'https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline' },
];
