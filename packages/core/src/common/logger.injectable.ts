/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createLogger, format } from "winston";
import type { Logger } from "./logger";
import { loggerTransportInjectionToken } from "./logger/transports";

const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (di): Logger => {
    const baseLogger = createLogger({
      format: format.combine(
        format.splat(),
        format.simple(),
      ),
      transports: di.injectMany(loggerTransportInjectionToken),
    });

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
