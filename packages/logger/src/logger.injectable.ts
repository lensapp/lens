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
import { winstonLoggerInjectable } from "./winston-logger.injectable";
import { pipeline } from "@ogre-tools/fp";

export interface Logger {
  info: LogFunction;
  error: LogFunction;
  debug: LogFunction;
  warn: LogFunction;
  silly: LogFunction;
}

/** @deprecated Use specific injectionToken, eg. logErrorInjectionToken */
export const loggerInjectionToken = getInjectionToken<Logger>({
  id: "logger-injection-token",
});

export const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (di): Logger => ({
    debug: getLogFunctionFor("debug", undefined)(di),
    info: getLogFunctionFor("info", undefined)(di),
    warn: getLogFunctionFor("warn", undefined)(di),
    error: getLogFunctionFor("error", undefined)(di),
    silly: getLogFunctionFor("silly", undefined)(di),
  }),

  decorable: false,
  injectionToken: loggerInjectionToken,
});

export type LogFunction = (message: string, ...data: unknown[]) => void;

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

const getLogFunctionFor = (
  scenario: keyof Logger,
  namespace: string | undefined
) => {
  const prefix = namespace
    ? `[${screamingKebabCase(namespace.replace(/-feature$/, ""))}]: `
    : "";

  return (di: DiContainerForInjection): LogFunction => {
    const winstonLogger = di.inject(winstonLoggerInjectable);

    return (message, ...data) => {
      winstonLogger[scenario](`${prefix}${message}`, ...data);
    };
  };
};

export const logDebugInjectable = getInjectable({
  id: "log-debug",
  instantiate: (di) => getLogFunctionFor("debug", di.sourceNamespace)(di),
  injectionToken: logDebugInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logInfoInjectable = getInjectable({
  id: "log-info",
  instantiate: (di) => getLogFunctionFor("info", di.sourceNamespace)(di),
  injectionToken: logInfoInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logWarningInjectable = getInjectable({
  id: "log-warning",
  instantiate: (di) => getLogFunctionFor("warn", di.sourceNamespace)(di),
  injectionToken: logWarningInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logErrorInjectable = getInjectable({
  id: "log-error",
  instantiate: (di) => getLogFunctionFor("error", di.sourceNamespace)(di),
  injectionToken: logErrorInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});

export const logSillyInjectable = getInjectable({
  id: "log-silly",
  instantiate: (di) => getLogFunctionFor("silly", di.sourceNamespace)(di),
  injectionToken: logSillyInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});
