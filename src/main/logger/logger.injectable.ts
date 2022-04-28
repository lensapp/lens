/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import winston, { format } from "winston";
import { consoleFormat } from "winston-console-format";
import type { Logger } from "../../common/logger";
import { baseLoggerInjectionToken } from "../../common/logger/logger.token";
import { isDebugging, isTestEnv } from "../../common/vars";
import appPathsInjectable from "../app-paths/app-paths.injectable";

const logLevel = process.env.LOG_LEVEL
  ? process.env.LOG_LEVEL
  : isDebugging
    ? "debug"
    : isTestEnv
      ? "error"
      : "info";

const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (di): Logger => {
    const logsPath = di.inject(appPathsInjectable).logs;

    return winston.createLogger({
      format: format.combine(
        format.splat(),
        format.simple(),
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: false,
          level: logLevel,
          format: format.combine(
            format.colorize({ level: true, message: false }),
            format.padLevels(),
            format.ms(),
            consoleFormat({
              showMeta: true,
              inspectOptions: {
                depth: 4,
                colors: true,
                maxArrayLength: 10,
                breakLength: 120,
                compact: Infinity,
              },
            }),
          ),
        }),
        new winston.transports.File({
          handleExceptions: false,
          level: logLevel,
          filename: "lens.log",
          dirname: logsPath,
          maxsize: 16 * 1024,
          maxFiles: 16,
          tailable: true,
        }),
      ],
    });
  },
  injectionToken: baseLoggerInjectionToken,
});

export default loggerInjectable;

