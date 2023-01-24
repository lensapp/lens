/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMain } from "electron";
import ipcMainInjectionToken from "../../../../common/ipc/ipc-main-injection-token";

const ipcMainInjectable = getInjectable({
  id: "ipc-main",
  instantiate: () => ipcMain,
  causesSideEffects: true,
  injectionToken: ipcMainInjectionToken,
});

export default ipcMainInjectable;
