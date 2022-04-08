/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app, ipcMain } from "electron";
import winston, { format } from "winston";
import type Transport from "winston-transport";
import { consoleFormat } from "winston-console-format";
import { isDebugging, isTestEnv } from "./vars";
import BrowserConsole from "winston-transport-browserconsole";

export interface Logger {
  info: (message: string, ...args: any) => void;
  error: (message: string, ...args: any) => void;
  debug: (message: string, ...args: any) => void;
  warn: (message: string, ...args: any) => void;
  silly: (message: string, ...args: any) => void;
}

const logLevel = process.env.LOG_LEVEL
  ? process.env.LOG_LEVEL
  : isDebugging
    ? "debug"
    : isTestEnv
      ? "error"
      : "info";

const transports: Transport[] = [];

if (ipcMain) {
  transports.push(
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
  );

  if (!isTestEnv) {
    transports.push(
      new winston.transports.File({
        handleExceptions: false,
        level: logLevel,
        filename: "lens.log",
        /**
         * SAFTEY: the `ipcMain` check above should mean that this is only
         * called in the main process
         */
        dirname: app.getPath("logs"),
        maxsize: 16 * 1024,
        maxFiles: 16,
        tailable: true,
      }),
    );
  }
} else {
  transports.push(new BrowserConsole());
}

export default winston.createLogger({
  format: format.combine(
    format.splat(),
    format.simple(),
  ),
  transports,
});
