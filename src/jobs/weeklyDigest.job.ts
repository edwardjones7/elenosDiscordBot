import { TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { getPostedSince } from '../services/news.service';
import { claudeService } from '../services/claude.service';
import { createBaseEmbed } from '../utils/embed.builder';
import { BRAND_COLOR } from '../config/constants';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ job: 'WeeklyDigestJob' });

export async function runWeeklyDigestJob(client: ExtendedClient): Promise<void> {
  if (!config.channels.techNews) {
    log.warn('TECH_NEWS_CHANNEL_ID not configured, skipping weekly digest');
    return;
  }

  const channel = client.channels.cache.get(config.channels.techNews) as TextChannel | undefined;
  if (!channel) return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articles = getPostedSince(sevenDaysAgo);

  if (articles.length === 0) {
    log.info('No articles from past week for digest');
    return;
  }

  log.info({ count: articles.length }, 'Generating weekly digest');

  const digest = await claudeService.generateWeeklyDigest(articles.slice(0, 20));

  await channel.send({
    embeds: [
      createBaseEmbed(BRAND_COLOR)
        .setTitle('🗞️ Week in Tech — Weekly Digest')
        .setDescription(digest)
        .setFooter({ text: `Covering ${articles.length} articles from the past 7 days • Elenos Bot` }),
    ],
  });

  log.info('Weekly digest posted');
}
