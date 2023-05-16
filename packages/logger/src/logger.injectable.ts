/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Logger } from "./logger";
import { winstonLoggerInjectable } from "./winston-logger.injectable";

export const loggerInjectionToken = getInjectionToken<Logger>({
  id: "logger-injection-token",
});

export const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (di): Logger => ({
    debug: di.inject(logDebugInjectionToken),
    info: di.inject(logInfoInjectionToken),
    warn: di.inject(logWarningInjectionToken),
    error: di.inject(logErrorInjectionToken),
    silly: di.inject(logSillyInjectionToken),
  }),

  decorable: false,
  injectionToken: loggerInjectionToken,
});

export type LogFunction = (message: string, ...data: any[]) => void;

export const logDebugInjectionToken = getInjectionToken<LogFunction>({
  id: "log-debug-injection-token",
});

export const logInfoInjectionToken = getInjectionToken<LogFunction>({
  id: "log-info-injection-token",
});

export const logWarningInjectionToken = getInjectionToken<LogFunction>({
  id: "log-warning-injection-token",
});

export const logErrorInjectionToken = getInjectionToken<LogFunction>({
  id: "log-error-injection-token",
});

export const logSillyInjectionToken = getInjectionToken<LogFunction>({
  id: "log-silly-injection-token",
});

export const logDebugInjectable = getInjectable({
  id: "log-debug",
  instantiate: (di): LogFunction => di.inject(winstonLoggerInjectable).debug,
  injectionToken: logDebugInjectionToken,
});

export const logInfoInjectable = getInjectable({
  id: "log-info",
  instantiate: (di): LogFunction => di.inject(winstonLoggerInjectable).info,
  injectionToken: logInfoInjectionToken,
});

export const logWarningInjectable = getInjectable({
  id: "log-warning",
  instantiate: (di): LogFunction => di.inject(winstonLoggerInjectable).warn,
  injectionToken: logWarningInjectionToken,
});

export const logErrorInjectable = getInjectable({
  id: "log-error",
  instantiate: (di): LogFunction => di.inject(winstonLoggerInjectable).error,
  injectionToken: logErrorInjectionToken,
});

export const logSillyInjectable = getInjectable({
  id: "log-silly",
  instantiate: (di): LogFunction => di.inject(winstonLoggerInjectable).silly,
  injectionToken: logSillyInjectionToken,
});
