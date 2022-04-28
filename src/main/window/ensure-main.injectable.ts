/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "./manager.injectable";

export type EnsureMainWindow = (showSplash?: boolean) => Promise<Electron.BrowserWindow>;

const ensureMainWindowInjectable = getInjectable({
  id: "ensure-main-window",
  instantiate: (di): EnsureMainWindow => {
    const windowManager = di.inject(windowManagerInjectable);

    return (showSplash) => windowManager.ensureMainWindow(showSplash);
  },
});

export default ensureMainWindowInjectable;
