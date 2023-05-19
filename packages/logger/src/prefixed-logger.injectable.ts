/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Logger, loggerInjectionToken } from "./logger.injectable";

/** @deprecated Use specific injectionToken, eg. logErrorInjectionToken */
export const prefixedLoggerInjectable = getInjectable({
  id: "prefixed-logger",
  instantiate: (di, prefix): Logger => {
    const logger = di.inject(loggerInjectionToken);

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
