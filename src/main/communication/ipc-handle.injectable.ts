/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IpcMainInvokeEvent } from "electron";
import ipcMainInjectable from "./ipc-main.injectable";

const ipcHandleInjectable = getInjectable({
  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any): void => {
      ipcMain.handle(channel, listener);
    };
  },
  lifecycle: lifecycleEnum.singleton,
});

export default ipcHandleInjectable;
