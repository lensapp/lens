/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autoUpdater } from "electron-updater";

const quitAndInstallUpdateInjectable = getInjectable({
  id: "quit-and-install-update",

  instantiate: () => () => {
    autoUpdater.quitAndInstall(true, true);
  },

  causesSideEffects: true,
});

export default quitAndInstallUpdateInjectable;
