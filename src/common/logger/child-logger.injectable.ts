/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ClaimChildLogger } from "./claim-child-logger.injectable";
import claimChildLoggerInjectable from "./claim-child-logger.injectable";
import { baseLoggerInjectionToken } from "./logger.token";
import type { Logger } from "./type";

interface Dependencies {
  baseLogger: Logger;
  claimChildLogger: ClaimChildLogger;
}

export interface ChildLoggerArgs {
  prefix: string;
  defaultMeta?: Record<string, any>;
}

const createChildLogger = ({ baseLogger, claimChildLogger }: Dependencies, { prefix, defaultMeta = {}}: ChildLoggerArgs): Logger => {
  const doDebugLogging = claimChildLogger(prefix);

  const joinMeta = (meta: any): any => {
    return {
      ...defaultMeta,
      ...meta,
    };
  };

  return {
    debug: (message, meta) => {
      if (doDebugLogging.get()) {
        baseLogger.debug(`[${prefix}]: ${message}`, joinMeta(meta));
      }
    },
    info: (message, meta) => void baseLogger.info(`[${prefix}]: ${message}`, joinMeta(meta)),
    error: (message, meta) => void baseLogger.error(`[${prefix}]: ${message}`, joinMeta(meta)),
    warn: (message, meta) => void baseLogger.warn(`[${prefix}]: ${message}`, joinMeta(meta)),
  };
};

const childLoggerInjectable = getInjectable({
  id: "child-logger",
  instantiate: (di, args: ChildLoggerArgs) => createChildLogger({
    baseLogger: di.inject(baseLoggerInjectionToken),
    claimChildLogger: di.inject(claimChildLoggerInjectable),
  }, args),
  lifecycle: lifecycleEnum.transient,
});

export default childLoggerInjectable;
