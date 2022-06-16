/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "./electron-updater.injectable";

const electronQuitAndInstallUpdateInjectable = getInjectable({
  id: "electron-quit-and-install-update",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);

    return () => {
      electronUpdater.quitAndInstall(true, true);
    };
  },
});

export default electronQuitAndInstallUpdateInjectable;
