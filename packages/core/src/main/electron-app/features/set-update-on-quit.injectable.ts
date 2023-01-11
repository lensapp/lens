/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "./electron-updater.injectable";

const setUpdateOnQuitInjectable = getInjectable({
  id: "set-update-on-quit",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);

    return (updateOnQuit: boolean) => {
      electronUpdater.autoInstallOnAppQuit = updateOnQuit;
    };
  },
});

export default setUpdateOnQuitInjectable;
