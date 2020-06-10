import * as winston from "winston"

const options = {
  colorize: true,
  handleExceptions: false,
  json: false,
  level: process.env.DEBUG === "true" ? "debug" : "info",
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(options),
  ],
});

export default logger
