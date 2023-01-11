/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMain } from "electron";

const ipcMainInjectable = getInjectable({
  id: "ipc-main",
  instantiate: () => ipcMain,
  causesSideEffects: true,
});

export default ipcMainInjectable;
