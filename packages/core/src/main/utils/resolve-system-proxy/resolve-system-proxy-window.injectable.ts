/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { BrowserWindow } from "electron";

const resolveSystemProxyWindowInjectable = getInjectable({
  id: "resolve-system-proxy-window",
  instantiate: () => new BrowserWindow({
    show: false,
  }),
  causesSideEffects: true,
});

export default resolveSystemProxyWindowInjectable;
