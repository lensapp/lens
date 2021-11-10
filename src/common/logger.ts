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

import { app, ipcRenderer } from "electron";
import winston, { format } from "winston";
import { consoleFormat } from "winston-console-format";
import { isDebugging, isTestEnv } from "./vars";

const logLevel = process.env.LOG_LEVEL
  ? process.env.LOG_LEVEL
  : isDebugging
    ? "debug"
    : isTestEnv
      ? "error"
      : "info";

interface Logger {
  silly(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  error(...args: any[]): void;
}

function createRendererLogger(): Logger {
  return {
    ...console,
    // eslint-disable-next-line no-console
    silly: (...args: any[]) => console.debug(...args),
  };
}

function createUnitTestingLogger(): Logger {
  return {
    silly: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };
}

function createMainLogger(): Logger {
  const transports: winston.transport[] = [
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
  ];

  if (app) {
    transports.push(
      new winston.transports.File({
        handleExceptions: false,
        level: logLevel,
        filename: "lens.log",
        dirname: app.getPath("logs"),
        maxsize: 16 * 1024,
        maxFiles: 16,
        tailable: true,
      }),
    );
  }

  return winston.createLogger({
    format: format.simple(),
    transports,
  });
}

function createLogger(): Logger {
  if (isTestEnv && !process.env.CICD) {
    // CICD is present during integration tests
    return createUnitTestingLogger();
  }

  if (ipcRenderer) {
    return createRendererLogger();
  }

  return createMainLogger();
}

export default createLogger();
