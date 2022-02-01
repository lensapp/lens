/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IpcMainEvent } from "electron";
import { ipcOnEventInjectionToken } from "../../common/communication/ipc-on-event-injection-token";
import ipcMainInjectable from "./ipc-main.injectable";

const ipcOnInjectable = getInjectable({
  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void): void => {
      ipcMain.on(channel, listener);
    };
  },
  injectionToken: ipcOnEventInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default ipcOnInjectable;
