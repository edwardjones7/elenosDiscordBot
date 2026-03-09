import pino from 'pino';
import { config } from '../config';

const transport =
  config.app.nodeEnv !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined;

export const logger = pino({
  level: config.app.logLevel,
  transport,
});
