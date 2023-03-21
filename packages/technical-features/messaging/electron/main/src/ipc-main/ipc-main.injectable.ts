import { getInjectable } from "@ogre-tools/injectable";
import { ipcMain } from "electron";

const ipcMainInjectable = getInjectable({
  id: "ipc-main",
  instantiate: () => ipcMain,
  causesSideEffects: true,
});

export default ipcMainInjectable;
