/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcMain } from "electron";
import { getGlobalOverride } from "@k8slens/test-utils";
import ipcMainInjectable from "./ipc-main.injectable";

export default getGlobalOverride(ipcMainInjectable, () => ({
  handle: () => {},
  on: () => {},
  off: () => {},
}) as unknown as IpcMain);
