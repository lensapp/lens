/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerTransportInjectionToken } from "../../common/logger/transports";
import winstonLoggerInjectable from "../../common/winston-logger.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/phases";

const closeLoggerOnQuitInjectable = getInjectable({
  id: "close-file-transport-on-quit",
  instantiate: (di) => ({
    run: () => {
      const transports = di.injectMany(loggerTransportInjectionToken);
      const winstonLogger = di.inject(winstonLoggerInjectable);

      winstonLogger.close();

      for (const transport of transports) {
        transport.close?.();
      }
    },
  }),
  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default closeLoggerOnQuitInjectable;
