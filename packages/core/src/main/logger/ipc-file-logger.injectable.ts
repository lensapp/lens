/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { transports } from "winston";
import directoryForLogsInjectable from "../../common/app-paths/directory-for-logs.injectable";
import IpcFileLogger from "./ipc-file-logger";

const ipcFileLoggerInjectable = getInjectable({
  id: "ipc-file-logger",
  instantiate: (di) =>
    new IpcFileLogger(
      {
        dirname: di.inject(directoryForLogsInjectable),
        maxsize: 1024 * 1024,
        maxFiles: 2,
        tailable: true,
      },
      (options: transports.FileTransportOptions) => new transports.File(options)
    ),
});

export default ipcFileLoggerInjectable;
