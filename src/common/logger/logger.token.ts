/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Logger } from "./type";

export const baseLoggerInjectionToken = getInjectionToken<Logger>({
  id: "base-logger-token",
});
