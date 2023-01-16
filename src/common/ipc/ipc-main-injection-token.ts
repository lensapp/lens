/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IpcMain } from "electron";

const ipcMainInjectionToken = getInjectionToken<IpcMain>({
  id: "ipc-main-injection-token",
});

export default ipcMainInjectionToken;
