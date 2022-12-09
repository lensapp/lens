/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { transports } from "winston";
import type winston from "winston";
import directoryForLogsInjectable from "../../common/app-paths/directory-for-logs.injectable";
import loggerInjectable from "../../common/logger.injectable";

const addFileLoggingInjectable = getInjectable({
  id: "add-renderer-file-logger-transport",
  causesSideEffects: true,
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable) as winston.Logger;

    return logger.add(new transports.File({
      handleExceptions: false,
      level: "debug",
      filename: "lens-renderer.log",
      dirname: di.inject(directoryForLogsInjectable),
      maxsize: 1024 * 1024,
      maxFiles: 1,
      tailable: true,
    }));
  },
});

export default addFileLoggingInjectable;
