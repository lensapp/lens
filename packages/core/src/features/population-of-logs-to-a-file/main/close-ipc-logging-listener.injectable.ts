/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import ipcFileLoggerInjectable from "./ipc-file-logger.injectable";
import {
  closeIpcFileLoggerChannel,
} from "../common/ipc-file-logger-channel";

const closeIpcFileLoggingListenerInjectable = getMessageChannelListenerInjectable({
  id: "close-ipc-file-logging",
  channel: closeIpcFileLoggerChannel,
  getHandler: (di) => {
    const ipcFileLogger = di.inject(ipcFileLoggerInjectable);

    return (fileId) => ipcFileLogger.close(fileId);
  },
});

export default closeIpcFileLoggingListenerInjectable;
