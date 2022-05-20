/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import ipcRendererInjectable from "../ipc-renderer.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcRendererEvent } from "electron";
import { enlistChannelListenerInjectionToken } from "../../../common/channel/enlist-channel-listener-injection-token";

const enlistChannelListenerInjectable = getInjectable({
  id: "enlist-channel-listener-for-renderer",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel, handler) => {
      const nativeCallback = (_: IpcRendererEvent, message: unknown) =>
        handler(message);

      ipcRenderer.on(channel.id, nativeCallback);

      return () => {
        ipcRenderer.off(channel.id, nativeCallback);
      };
    };
  },

  injectionToken: enlistChannelListenerInjectionToken,
});

export default enlistChannelListenerInjectable;
