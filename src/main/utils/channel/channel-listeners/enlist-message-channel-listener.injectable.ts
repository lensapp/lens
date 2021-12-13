/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainEvent } from "electron";
import { enlistMessageChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import ipcMainInjectionToken from "../../../../common/ipc/ipc-main-injection-token";
import type { MessageChannel, MessageChannelListener } from "../../../../common/utils/channel/message-channel-listener-injection-token";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-main",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectionToken);

    return <T>({ channel, handler }: MessageChannelListener<MessageChannel<T>>) => {
      const nativeOnCallback = (_: IpcMainEvent, message: T) => {
        handler(message);
      };

      ipcMain.on(channel.id, nativeOnCallback);

      return () => {
        ipcMain.off(channel.id, nativeOnCallback);
      };
    };
  },

  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export default enlistMessageChannelListenerInjectable;
