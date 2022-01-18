/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Transport from "winston-transport";
import { LEVEL } from "triple-beam";
import { Severity } from "@sentry/browser";
import * as Sentry from "@sentry/electron";

const SENTRY_LEVELS_MAP = {
  silly: Severity.Debug,
  verbose: Severity.Debug,
  debug: Severity.Debug,
  info: Severity.Info,
  warn: Severity.Warning,
  error: Severity.Error,
};
const WINSTON_CMP: Record<WinstonLevel, Set<WinstonLevel>> = {
  silly: new Set(["silly", "verbose", "debug", "info", "warn", "error"]),
  verbose: new Set(["verbose", "debug", "info", "warn", "error"]),
  debug: new Set(["debug", "info", "warn", "error"]),
  info: new Set(["info", "warn", "error"]),
  warn: new Set(["warn", "error"]),
  error: new Set(["error"]),
};

export type WinstonLevel = keyof typeof SENTRY_LEVELS_MAP;

export class SentryTransport extends Transport {
  logLevels: Set<WinstonLevel>;

  constructor(minWinstonLevel: WinstonLevel) {
    super();

    this.logLevels = WINSTON_CMP[minWinstonLevel];
  }

  log(info: any, next: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const { message, level: _, tags, user, ...extra } = info;
    const winstonLevel: WinstonLevel = info[LEVEL];
    const level = SENTRY_LEVELS_MAP[winstonLevel];

    try {
      if (this.logLevels.has(winstonLevel)) {
        Sentry.captureMessage(message, {
          level,
          tags,
          extra,
        });
      }
    } finally {
      next();
    }
  }
}
