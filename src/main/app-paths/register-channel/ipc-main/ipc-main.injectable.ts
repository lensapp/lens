/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ipcMain } from "electron";

const ipcMainInjectable = getInjectable({
  instantiate: () => ipcMain,
  lifecycle: lifecycleEnum.singleton,
  causesSideEffects: true,
});

export default ipcMainInjectable;
