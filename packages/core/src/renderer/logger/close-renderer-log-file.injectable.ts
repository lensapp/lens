/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import winstonLoggerInjectable from "../../common/winston-logger.injectable";
import { closeIpcFileLoggerChannel } from "../../common/logger/ipc-file-logger-channel";
import { sendMessageToChannelInjectionToken } from "../../common/utils/channel/message-to-channel-injection-token";
import rendererLogFileIdInjectable from "./renderer-log-file-id.injectable";
import ipcLogTransportInjectable from "./ipc-transport.injectable";

const closeRendererLogFileInjectable = getInjectable({
  id: "close-renderer-log-file",
  instantiate: (di) => {
    const winstonLogger = di.inject(winstonLoggerInjectable);
    const ipcLogTransport = di.inject(ipcLogTransportInjectable);
    const messageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const fileId = di.inject(rendererLogFileIdInjectable);


    return () => {
      messageToChannel(closeIpcFileLoggerChannel, fileId);
      winstonLogger.remove(ipcLogTransport);
    };
  },
});

export default closeRendererLogFileInjectable;
