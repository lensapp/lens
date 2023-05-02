/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { getInjectable } from "@ogre-tools/injectable";
import { winstonLoggerInjectable } from "@k8slens/logger";
import { closeIpcFileLoggerChannel } from "../common/ipc-file-logger-channel";
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
