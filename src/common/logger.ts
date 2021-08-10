/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { app, ipcMain, remote } from "electron";
import winston from "winston";
import { consoleFormat } from "winston-console-format";
import { isDebugging, isTestEnv } from "./vars";
import BrowserConsole from "winston-transport-browserconsole";


const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : isDebugging ? "debug" : "info";
let consoleOptions: winston.transports.ConsoleTransportOptions;

if (ipcMain) {
  consoleOptions = {
    handleExceptions: false,
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize({ level: true, message: false}),
      winston.format.padLevels(),
      winston.format.ms(),
      consoleFormat({
        showMeta: true,
        inspectOptions: {
          depth: 4,
          colors: true,
          maxArrayLength: 10,
          breakLength: 120,
          compact: Infinity,
        },
      })
    )
  };
} else {
  consoleOptions = {
    handleExceptions: false,
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize({ level: true, message: false}),
    )
  };
}

const fileOptions: winston.transports.FileTransportOptions = {
  handleExceptions: false,
  level: logLevel,
  filename: "lens.log",
  dirname: (app ?? remote?.app)?.getPath("logs"),
  maxsize: 16 * 1024,
  maxFiles: 16,
  tailable: true,
};
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.simple()
  ),
  transports: [
    ipcMain ? new winston.transports.Console(consoleOptions) : new BrowserConsole(),
    ...(isTestEnv ? [] : [new winston.transports.File(fileOptions)]),
  ],
});

export default logger;
