/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autoUpdater } from "electron-updater";

const electronUpdaterInjectable = getInjectable({
  id: "electron-updater",
  instantiate: () => autoUpdater,
  causesSideEffects: true,
});

export default electronUpdaterInjectable;
