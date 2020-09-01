import { app } from "electron";
import winston from "winston"
import { isDebugging } from "../common/vars";
import logform from "logform"

const options = {
  colorize: true,
  handleExceptions: false,
  json: false,
  level: isDebugging ? "debug" : "info",
}

function ignoreInRenderer<T>(...args: (() => T)[]): T[] {
  return app ? args.map(f => f()) : [];
}

const logger = winston.createLogger({
  format: winston.format.combine(
    ...ignoreInRenderer(
      () => winston.format.errors({ stack: true }),
      () => winston.format(function (info: logform.TransformableInfo, opts?: any): boolean | logform.TransformableInfo {
        if (info.stack) {
          info.message += `\n\t${(info.stack as string).replace(/\n/g, "\n\t")}`;
          delete info.stack
        }
        return info
      })(),
    ),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(options),
  ],
});

export default logger
