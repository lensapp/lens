import { getInjectable } from "@ogre-tools/injectable";
import { ipcRenderer } from "electron";

const ipcRendererInjectable = getInjectable({
  id: "ipc-renderer",
  instantiate: () => ipcRenderer,
  causesSideEffects: true,
});

export default ipcRendererInjectable;
