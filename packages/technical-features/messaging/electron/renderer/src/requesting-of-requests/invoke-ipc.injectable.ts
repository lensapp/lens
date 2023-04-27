import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";

const invokeIpcInjectable = getInjectable({
  id: "invoke-ipc",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args);
  },
});

export default invokeIpcInjectable;
