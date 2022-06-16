/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import ipcRendererInjectable from "../ipc-renderer.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcRendererEvent } from "electron";
import { enlistMessageChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import { tentativeParseJson } from "../../../../common/utils/tentative-parse-json";
import { pipeline } from "@ogre-tools/fp";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-renderer",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return ({ channel, handler }) => {
      const nativeCallback = (_: IpcRendererEvent, message: unknown) => {
        pipeline(
          message,
          tentativeParseJson,
          handler,
        );
      };

      console.debug(`[IPC]: listening on ${channel.id}`);
      ipcRenderer.on(channel.id, nativeCallback);

      return () => {
        console.debug(`[IPC]: listenering off ${channel.id}`);
        ipcRenderer.off(channel.id, nativeCallback);
      };
    };
  },

  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export default enlistMessageChannelListenerInjectable;
