import cron from 'node-cron';
import { ExtendedClient } from '../types';
import { runTechNewsJob } from './techNews.job';
import { runCryptoNewsJob } from './cryptoNews.job';
import { runStockNewsJob } from './stockNews.job';
import { runWeeklyDigestJob } from './weeklyDigest.job';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'Jobs' });

export function registerJobs(client: ExtendedClient): void {
  cron.schedule(config.news.postInterval, () => {
    runTechNewsJob(client).catch((err) => log.error({ err }, 'Tech news job failed'));
    runCryptoNewsJob(client).catch((err) => log.error({ err }, 'Crypto news job failed'));
    runStockNewsJob(client).catch((err) => log.error({ err }, 'Stock news job failed'));
  });
  log.info({ schedule: config.news.postInterval }, 'News jobs scheduled');

  cron.schedule(config.news.weeklyDigestSchedule, () => {
    runWeeklyDigestJob(client).catch((err) => log.error({ err }, 'Weekly digest job failed'));
  });
  log.info({ schedule: config.news.weeklyDigestSchedule }, 'Weekly digest job scheduled');
}

export { runCryptoNewsJob, runStockNewsJob };
