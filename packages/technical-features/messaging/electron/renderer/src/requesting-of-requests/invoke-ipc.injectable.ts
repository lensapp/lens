import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";

const invokeIpcInjectable = getInjectable({
  id: "invoke-ipc",

  instantiate: (di) => di.inject(ipcRendererInjectable).invoke,
});

export default invokeIpcInjectable;
