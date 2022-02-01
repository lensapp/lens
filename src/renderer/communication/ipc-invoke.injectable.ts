/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";

const ipcInvokeInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default ipcInvokeInjectable;
