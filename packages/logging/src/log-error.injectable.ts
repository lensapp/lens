/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { loggerInjectable } from "./logger.injectable";

type LogError = (message: string, ...args: any) => void;

export const logErrorInjectionToken = getInjectionToken<LogError>({
  id: "logger",
});

export const logErrorInjectable = getInjectable({
  id: "log-error",
  instantiate: (di) => di.inject(loggerInjectable).error,
  injectionToken: logErrorInjectionToken,
  decorable: false,
});
