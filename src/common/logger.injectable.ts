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
  instantiate: (di): Logger => createLogger({
    format: format.combine(
      format.splat(),
      format.simple(),
    ),
    transports: di.injectMany(loggerTransportInjectionToken),
  }),
});

export default loggerInjectable;
