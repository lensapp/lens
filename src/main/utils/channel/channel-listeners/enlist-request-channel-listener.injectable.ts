/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainInvokeEvent } from "electron";
import ipcMainInjectable from "../ipc-main/ipc-main.injectable";
import { enlistRequestChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-request-channel-listener-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { tentativeParseJson } from "../../../../common/utils/tentative-parse-json";
import { tentativeStringifyJson } from "../../../../common/utils/tentative-stringify-json";

const enlistRequestChannelListenerInjectable = getInjectable({
  id: "enlist-request-channel-listener-for-main",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return ({ channel, handler }) => {
      const nativeHandleCallback = (_: IpcMainInvokeEvent, request: unknown) =>
        pipeline(request, tentativeParseJson, handler, tentativeStringifyJson);

      ipcMain.handle(channel.id, nativeHandleCallback);

      return () => {
        ipcMain.off(channel.id, nativeHandleCallback);
      };
    };
  },

  injectionToken: enlistRequestChannelListenerInjectionToken,
});

export default enlistRequestChannelListenerInjectable;
