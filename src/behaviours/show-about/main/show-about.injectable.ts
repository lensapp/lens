/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import showMessagePopupInjectable from "../../../main/electron-app/features/show-message-popup.injectable";
import packageJson from "../../../../package.json";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import appNameInjectable from "../../../main/app-paths/app-name/app-name.injectable";
import electronAppInjectable from "../../../main/electron-app/electron-app.injectable";
import productNameInjectable from "../../../main/app-paths/app-name/product-name.injectable";

const showAboutInjectable = getInjectable({
  id: "show-about",

  instantiate: (di) => {
    const showMessagePopup = di.inject(showMessagePopupInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const appName = di.inject(appNameInjectable);
    const app = di.inject(electronAppInjectable);
    const productName = di.inject(productNameInjectable);

    return async () => {
      const appInfo = [
        `${appName}: ${app.getVersion()}`,
        `Electron: ${process.versions.electron}`,
        `Chrome: ${process.versions.chrome}`,
        `Node: ${process.versions.node}`,
        packageJson.copyright,
      ];

      await showMessagePopup(
        `${isWindows ? " ".repeat(2) : ""}${appName}`,
        productName,
        appInfo.join("\r\n"),
      );
    };
  },

  causesSideEffects: true,
});

export default showAboutInjectable;
