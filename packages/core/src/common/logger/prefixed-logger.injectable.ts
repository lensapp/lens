/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Logger } from "../logger";
import loggerInjectable from "../logger.injectable";

const prefixedLoggerInjectable = getInjectable({
  id: "prefixed-logger",
  instantiate: (di, prefix): Logger => {
    const logger = di.inject(loggerInjectable);

    return {
      debug: (message, ...args) => {
        logger.debug(`[${prefix}]: ${message}`, ...args);
      },
      error: (message, ...args) => {
        logger.error(`[${prefix}]: ${message}`, ...args);
      },
      info: (message, ...args) => {
        logger.info(`[${prefix}]: ${message}`, ...args);
      },
      silly: (message, ...args) => {
        logger.silly(`[${prefix}]: ${message}`, ...args);
      },
      warn: (message, ...args) => {
        logger.warn(`[${prefix}]: ${message}`, ...args);
      },
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, prefix: string) => prefix,
  }),
});

export default prefixedLoggerInjectable;
