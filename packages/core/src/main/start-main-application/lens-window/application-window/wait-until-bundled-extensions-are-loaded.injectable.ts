/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { bundledExtensionsLoaded } from "../../../../common/ipc/extension-handling";
import { delay } from "../../../../common/utils";
import ipcMainInjectable from "../../../utils/channel/ipc-main/ipc-main.injectable";

const waitUntilBundledExtensionsAreLoadedInjectable = getInjectable({
  id: "wait-until-bundled-extensions-are-loaded",

  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return async () => {
      const viewHasLoaded = new Promise<void>((resolve) => {
        ipcMain.once(bundledExtensionsLoaded, () => resolve());
      });

      await viewHasLoaded;
      await delay(50); // wait just a bit longer to let the first round of rendering happen
    };
  },

  causesSideEffects: true,
});

export default waitUntilBundledExtensionsAreLoadedInjectable;
