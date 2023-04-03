import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcRendererEvent } from "electron";
import { enlistMessageChannelListenerInjectionToken } from "@k8slens/messaging";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-renderer",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return ({ channel, handler }) => {
      const nativeCallback = (_: IpcRendererEvent, message: any) => {
        handler(message);
      };

      ipcRenderer.on(channel.id, nativeCallback);

      return () => {
        ipcRenderer.off(channel.id, nativeCallback);
      };
    };
  },

  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export default enlistMessageChannelListenerInjectable;
