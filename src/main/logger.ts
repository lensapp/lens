import { app, remote } from "electron";
import winston from "winston"
import { isDebugging } from "../common/vars";
import { format } from "logform";
import stringify from "string.ify";
import { MESSAGE } from "triple-beam";

const debugSimple = format(info => {
  const rest = Object.assign({}, info);
  delete rest.level;
  delete rest.message;
  delete rest.splat;

  const stringifiedRest = stringify.configure({ maxStringLength: 300 })(rest);

  const padding = info.padding?.[info.level] || '';
  if (stringifiedRest !== '{}') {
    info[MESSAGE as any] = `${info.level}:${padding} ${info.message} ${stringifiedRest}`;
  } else {
    info[MESSAGE as any] = `${info.level}:${padding} ${info.message}`;
  }

  return info;
});

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
    isDebugging ? debugSimple() : winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(consoleOptions),
    new winston.transports.File(fileOptions),
  ],
});

export default logger
