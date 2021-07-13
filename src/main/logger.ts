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

import { app, remote } from "electron";
import winston from "winston";
import { isDebugging, isTestEnv } from "../common/vars";

const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : isDebugging ? "debug" : "info";
const consoleOptions: winston.transports.ConsoleTransportOptions = {
  handleExceptions: false,
  level: logLevel,
};
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
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(consoleOptions),
    ...(isTestEnv ? [] : [new winston.transports.File(fileOptions)]),
  ],
});

export default logger;
