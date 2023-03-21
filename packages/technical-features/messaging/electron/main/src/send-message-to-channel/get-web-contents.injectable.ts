/* c8 ignore start */
import { getInjectable } from "@ogre-tools/injectable";
import { webContents } from "electron";

const getWebContentsInjectable = getInjectable({
  id: "web-contents",
  instantiate: () => () => webContents.getAllWebContents(),
  causesSideEffects: true,
});

export default getWebContentsInjectable;
/* c8 ignore stop */
