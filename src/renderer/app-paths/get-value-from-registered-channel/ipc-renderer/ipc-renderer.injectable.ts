/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ipcRenderer } from "electron";

const ipcRendererInjectable = getInjectable({
  instantiate: () => ipcRenderer,
  lifecycle: lifecycleEnum.singleton,
  causesSideEffects: true,
});

export default ipcRendererInjectable;
