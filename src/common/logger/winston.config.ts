import * as winston from 'winston';
import { utilities } from 'nest-winston';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const winstonConfig: winston.LoggerOptions = {
  level: isDev ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        isDev
          ? utilities.format.nestLike('API', { prettyPrint: true })
          : winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
