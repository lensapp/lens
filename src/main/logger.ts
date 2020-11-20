import { app, remote } from "electron";
import winston from "winston"
import { isDebugging } from "../common/vars";

const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : isDebugging ? "debug" : "info"

const consoleOptions: winston.transports.ConsoleTransportOptions = {
  handleExceptions: false,
  level: logLevel,
}

const fileOptions: winston.transports.FileTransportOptions = {
  handleExceptions: false,
  level: logLevel,
  filename: "lens.log",
  dirname: (app ?? remote?.app)?.getPath("logs"),
  maxsize: 16 * 1024,
  maxFiles: 16,
  tailable: true,
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(consoleOptions),
    new winston.transports.File(fileOptions),
  ],
});

export default logger
