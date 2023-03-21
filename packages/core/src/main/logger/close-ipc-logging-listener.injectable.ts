/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import ipcFileLoggerInjectable from "./ipc-file-logger.injectable";
import { getMessageChannelListenerInjectable } from "../../common/utils/channel/message-channel-listener-injection-token";
import {
  closeIpcFileLoggerChannel,
} from "../../common/logger/ipc-file-logger-channel";

const closeIpcFileLoggingListenerInjectable = getMessageChannelListenerInjectable({
  id: "close-ipc-file-logging",
  channel: closeIpcFileLoggerChannel,
  handler: (di) => {
    const ipcFileLogger = di.inject(ipcFileLoggerInjectable);

    return (fileId) => ipcFileLogger.close(fileId);
  },
});

export default closeIpcFileLoggingListenerInjectable;
