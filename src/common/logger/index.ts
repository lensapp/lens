/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Environments, getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import type { Logger } from "./type";
import { baseLoggerInjectionToken } from "./logger.token";

export type { Logger };

function legacyLog(level: keyof Logger, message: string, args: any[]) {
  const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi(Environments.renderer)
    ?? getEnvironmentSpecificLegacyGlobalDiForExtensionApi(Environments.main);

  if (!di) {
    return;
  }

  const logger = di.inject(baseLoggerInjectionToken);

  logger[level](message, ...args);
}

/**
 * @deprecated create a new child logger with `di.inject(createChildLogger, { prefix: ... })`
 */
const logger: Logger = {
  debug: (message, ...args) => legacyLog("debug", message, args),
  info: (message, ...args) => legacyLog("info", message, args),
  error: (message, ...args) => legacyLog("error", message, args),
  warn: (message, ...args) => legacyLog("warn", message, args),
};

export default logger;
