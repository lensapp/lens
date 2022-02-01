/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IpcRendererEvent } from "electron";
import { ipcOnEventInjectionToken } from "../../common/communication/ipc-on-event-injection-token";
import ipcRendererInjectable from "./ipc-renderer.injectable";

const ipcOnInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
      ipcRenderer.on(channel, listener);
    };
  },
  injectionToken: ipcOnEventInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default ipcOnInjectable;
