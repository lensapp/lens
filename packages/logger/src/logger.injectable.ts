/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { kebabCase, toUpper } from "lodash/fp";
import {
  DiContainerForInjection,
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import type { Logger } from "./logger";
import { winstonLoggerInjectable } from "./winston-logger.injectable";
import { pipeline } from "@ogre-tools/fp";

/** @deprecated Use specific injectionToken, eg. logErrorInjectionToken */
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

const screamingKebabCase = (str: string) => pipeline(str, kebabCase, toUpper);

const getLogFunctionFor =
  (scenario: keyof Logger) =>
  (di: DiContainerForInjection): LogFunction => {
    const winstonLogger = di.inject(winstonLoggerInjectable);

    return (message, ...data) => {
      winstonLogger[scenario](
        di.sourceNamespace
          ? `[${screamingKebabCase(di.sourceNamespace)}]: ${message}`
          : message,
        ...data
      );
    };
  };

export const logDebugInjectable = getInjectable({
  id: "log-debug",
  instantiate: getLogFunctionFor("debug"),
  injectionToken: logDebugInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logInfoInjectable = getInjectable({
  id: "log-info",
  instantiate: getLogFunctionFor("info"),
  injectionToken: logInfoInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logWarningInjectable = getInjectable({
  id: "log-warning",
  instantiate: getLogFunctionFor("warn"),
  injectionToken: logWarningInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logErrorInjectable = getInjectable({
  id: "log-error",
  instantiate: getLogFunctionFor("error"),
  injectionToken: logErrorInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logSillyInjectable = getInjectable({
  id: "log-silly",
  instantiate: getLogFunctionFor("silly"),
  injectionToken: logSillyInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});
