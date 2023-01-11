/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "./electron-updater.injectable";

const electronUpdaterIsActiveInjectable = getInjectable({
  id: "electron-updater-is-active",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);

    return electronUpdater.isUpdaterActive();
  },
});

export default electronUpdaterIsActiveInjectable;
