/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { transports } from "winston";
import directoryForLogsInjectable from "../../common/app-paths/directory-for-logs.injectable";
import { loggerTransportInjectionToken } from "@k8slens/logger";

const fileLoggerTransportInjectable = getInjectable({
  id: "file-logger-transport",
  instantiate: (di) => new transports.File({
    handleExceptions: false,
    level: "debug",
    filename: "lens.log",
    /**
         * SAFTEY: the `ipcMain` check above should mean that this is only
         * called in the main process
         */
    dirname: di.inject(directoryForLogsInjectable),
    maxsize: 1024 * 1024,
    maxFiles: 16,
    tailable: true,
  }),
  injectionToken: loggerTransportInjectionToken,
  decorable: false,
});

export default fileLoggerTransportInjectable;
