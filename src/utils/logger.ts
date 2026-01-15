import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

const formats = winston.format;

const logger = winston.createLogger({
  level: logLevel,
  format: formats.combine(
    formats.timestamp({ format: 'iso' }),
    formats.errors({ stack: true }),
    logFormat === 'json' ? formats.json() : formats.simple()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: formats.combine(
        formats.colorize(),
        formats.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: formats.combine(
        formats.timestamp(),
        formats.json()
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: formats.combine(
        formats.timestamp(),
        formats.json()
      ),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: formats.combine(
        formats.colorize(),
        formats.simple()
      ),
    })
  );
}

export default logger;
