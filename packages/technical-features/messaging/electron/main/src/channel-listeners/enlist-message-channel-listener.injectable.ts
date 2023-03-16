import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMainEvent } from "electron";
import ipcMainInjectable from "../ipc-main/ipc-main.injectable";
import { enlistMessageChannelListenerInjectionToken } from "@k8slens/messaging";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return ({ channel, handler }) => {
      const nativeOnCallback = (nativeEvent: IpcMainEvent, message: any) => {
        handler(message, { frameId: nativeEvent.frameId, processId: nativeEvent.processId });
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
