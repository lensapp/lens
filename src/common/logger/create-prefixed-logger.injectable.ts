/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { LensLogger } from "../logger";
import logger from "../logger";
import { bind } from "../utils";

interface Dependencies {
  rootLogger: LensLogger;
}

function createPrefixedLogger({ rootLogger }: Dependencies, prefix: string): LensLogger {
  return {
    debug: (...args: any[]) => void rootLogger.debug(prefix, ...args),
    warn: (...args: any[]) => void rootLogger.warn(prefix, ...args),
    silly: (...args: any[]) => void rootLogger.silly(prefix, ...args),
    info: (...args: any[]) => void rootLogger.info(prefix, ...args),
    error: (...args: any[]) => void rootLogger.error(prefix, ...args),
  };
}

const createPrefixedLoggerInjectable = getInjectable({
  instantiate: () => bind(createPrefixedLogger, null, {
    // TODO make injectable
    rootLogger: logger,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createPrefixedLoggerInjectable;
