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
    let closed = false;

    baseLogger.once("close", () => {
      closed = true;
    });

    return {
      debug: (message, ...data) => {
        if (closed) {
          console.debug(message, ...data);
        } else {
          baseLogger.debug(message, ...data);
        }
      },
      info: (message, ...data) => {
        if (closed) {
          console.info(message, ...data);
        } else {
          baseLogger.info(message, ...data);
        }
      },
      warn: (message, ...data) => {
        if (closed) {
          console.warn(message, ...data);
        } else {
          baseLogger.warn(message, ...data);
        }
      },
      error: (message, ...data) => {
        if (closed) {
          console.error(message, ...data);
        } else {
          baseLogger.error(message, ...data);
        }
      },
      silly: (message, ...data) => {
        if (closed) {
          // DO nothing
        } else {
          baseLogger.silly(message, ...data);
        }
      },
    };
  },

  decorable: false,
});

export default loggerInjectable;
