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
