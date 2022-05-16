/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainEvent } from "electron";
import ipcMainInjectable from "../../app-paths/register-channel/ipc-main/ipc-main.injectable";
import { enlistChannelListenerInjectionToken } from "../../../common/sync-box/channel/enlist-channel-listener-injection-token";

const enlistChannelListenerInjectable = getInjectable({
  id: "enlist-channel-listener-for-main",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel: any, handler: any) => {
      const nativeCallback = (_: IpcMainEvent, message: unknown) =>
        handler(message);

      ipcMain.on(channel.id, nativeCallback);

      return () => {
        ipcMain.off(channel.id, nativeCallback);
      };
    };
  },

  injectionToken: enlistChannelListenerInjectionToken,
});

export default enlistChannelListenerInjectable;
