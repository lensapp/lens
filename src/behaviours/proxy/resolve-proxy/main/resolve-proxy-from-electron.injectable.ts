/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronInjectable from "./electron.injectable";
import createTemporaryBrowserWindowInjectable from "./create-temporary-browser-window.injectable";

const resolveProxyFromElectronInjectable = getInjectable({
  id: "resolve-proxy-from-electron",

  instantiate: (di) => {
    const electron = di.inject(electronInjectable);
    const createTemporaryBrowserWindow = di.inject(createTemporaryBrowserWindowInjectable);

    return async (url: string) => {
      const webContent = electron.webContents
        .getAllWebContents()
        .find((x) => !x.isDestroyed());

      if(!webContent) {
        const tempWindow = createTemporaryBrowserWindow();
        const proxy = await tempWindow.webContents.session.resolveProxy(url);

        tempWindow.destroy();

        return proxy;
      }

      return webContent?.session.resolveProxy(url);
    };
  },
});

export default resolveProxyFromElectronInjectable;
