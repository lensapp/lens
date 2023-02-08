/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Logger } from "./logger";
import winstonLoggerInjectable from "./winston-logger.injectable";

const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (di): Logger => {
    const baseLogger = di.inject(winstonLoggerInjectable);

    return {
      debug: (message, ...data) => baseLogger.debug(message, ...data),
      info: (message, ...data) => baseLogger.info(message, ...data),
      warn: (message, ...data) => baseLogger.warn(message, ...data),
      error: (message, ...data) => baseLogger.error(message, ...data),
      silly: (message, ...data) => baseLogger.silly(message, ...data),
    };
  },
});

export default loggerInjectable;
