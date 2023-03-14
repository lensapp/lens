/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../start-main-application/runnable-tokens/phases";
import ipcFileLoggerInjectable from "./ipc-file-logger.injectable";

const stopIpcLoggingInjectable = getInjectable({
  id: "stop-ipc-logging",

  instantiate: (di) => {
    const ipcFileLogger = di.inject(ipcFileLoggerInjectable);

    return {
      run: () => {
        ipcFileLogger.closeAll();

        return undefined;
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopIpcLoggingInjectable;
