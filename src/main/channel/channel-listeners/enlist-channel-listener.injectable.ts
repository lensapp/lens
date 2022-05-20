/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import ipcMainInjectable from "../../app-paths/register-channel/ipc-main/ipc-main.injectable";
import { enlistChannelListenerInjectionToken } from "../../../common/channel/enlist-channel-listener-injection-token";

const enlistChannelListenerInjectable = getInjectable({
  id: "enlist-channel-listener-for-main",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel, handler) => {
      const nativeOnCallback = (_: IpcMainEvent, message: unknown) =>
        handler(message);

      ipcMain.on(channel.id, nativeOnCallback);

      const nativeHandleCallback = (_: IpcMainInvokeEvent, message: unknown) =>
        handler(message);

      ipcMain.handle(channel.id, nativeHandleCallback);

      return () => {
        ipcMain.off(channel.id, nativeOnCallback);
        ipcMain.off(channel.id, nativeHandleCallback);
      };
    };
  },

  injectionToken: enlistChannelListenerInjectionToken,
});

export default enlistChannelListenerInjectable;
