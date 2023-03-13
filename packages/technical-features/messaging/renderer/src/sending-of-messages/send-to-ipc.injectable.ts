import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../ipc/ipc-renderer.injectable";

const sendToIpcInjectable = getInjectable({
  id: "send-to-ipc",

  instantiate: (di) => di.inject(ipcRendererInjectable).send,
});

export default sendToIpcInjectable;
