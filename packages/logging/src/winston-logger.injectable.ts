/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { createLogger, format } from "winston";
import type { Logger as WinstonLogger } from "winston";
import { loggerTransportInjectionToken } from "./transports";

export const winstonLoggerInjectionToken = getInjectionToken<WinstonLogger>({
  id: "winston-logger",
});

export const winstonLoggerInjectable = getInjectable({
  id: "winston-logger",
  instantiate: (di) =>
    createLogger({
      format: format.combine(format.splat(), format.simple()),
      transports: di.injectMany(loggerTransportInjectionToken),
    }),
});
