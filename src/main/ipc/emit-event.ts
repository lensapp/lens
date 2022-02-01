/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import ipcMainInjectable from "../communication/ipc-main.injectable";

const emitEventInjectable = getInjectable({
  instantiate: (di) => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel: string, ...args: any[]) => {
      ipcMain.emit(channel, ...args);
    };
  },
  lifecycle: lifecycleEnum.singleton,
});

export default emitEventInjectable;
