/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainEvent } from "electron";
import ipcMainInjectable from "../ipc-main/ipc-main.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { tentativeParseJson } from "../../../../common/utils/tentative-parse-json";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-main",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return ({ channel, handler }) => {
      const nativeOnCallback = (_: IpcMainEvent, message: unknown) => {
        pipeline(
          message,
          tentativeParseJson,
          handler,
        );
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
