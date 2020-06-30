import winston from "winston"
import { isDebugging } from "../common/vars";

const options = {
  colorize: true,
  handleExceptions: false,
  json: false,
  level: isDebugging ? "debug" : "info",
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
