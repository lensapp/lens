/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { transports } from "winston";
import directoryForLogsInjectable from "../../../common/app-paths/directory-for-logs.injectable";

const createIpcFileLoggerTransportInjectable = getInjectable({
  id: "create-ipc-file-logger-transport",
  instantiate: (di) => {
    const options = {
      dirname: di.inject(directoryForLogsInjectable),
      maxsize: 1024 * 1024,
      maxFiles: 2,
      tailable: true,
    };

    return (fileId: string) =>
      new transports.File({
        ...options,
        filename: `lens-${fileId}.log`,
      });
  },
  causesSideEffects: true,
});

export default createIpcFileLoggerTransportInjectable;
