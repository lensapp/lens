/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { LensLogger } from "../logger";
import baseLoggerInjectable from "./base-logger.injectable";

interface Dependencies {
  baseLogger: LensLogger;
}

const createChildLogger = ({ baseLogger }: Dependencies) => (
  (prefix: string): LensLogger => {
    return {
      debug: (message, info) => baseLogger.debug(`${prefix}: ${message}`, info),
      warn: (message, info) => baseLogger.warn(`${prefix}: ${message}`, info),
      error: (message, info) => baseLogger.error(`${prefix}: ${message}`, info),
      verbose: (message, info) => baseLogger.verbose(`${prefix}: ${message}`, info),
      info: (message, info) => baseLogger.info(`${prefix}: ${message}`, info),
      silly: (message, info) => baseLogger.silly(`${prefix}: ${message}`, info),
    };
  }
);

const createChildLoggerInjectable = getInjectable({
  instantiate: (di) => createChildLogger({
    baseLogger: di.inject(baseLoggerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createChildLoggerInjectable;
