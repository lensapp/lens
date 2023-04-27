import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";

const sendToIpcInjectable = getInjectable({
  id: "send-to-ipc",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args);
  },
});

export default sendToIpcInjectable;
