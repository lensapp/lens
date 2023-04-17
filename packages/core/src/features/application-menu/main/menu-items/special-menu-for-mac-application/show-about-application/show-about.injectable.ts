/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import showMessagePopupInjectable from "../../../../../../main/electron-app/features/show-message-popup.injectable";
import isWindowsInjectable from "../../../../../../common/vars/is-windows.injectable";
import appNameInjectable from "../../../../../../common/vars/app-name.injectable";
import productNameInjectable from "../../../../../../common/vars/product-name.injectable";
import extensionApiVersionInjectable from "../../../../../../common/vars/extension-api-version.injectable";
import applicationCopyrightInjectable from "../../../../../../common/vars/application-copyright.injectable";
import specificVersionsInjectable from "./about-bundled-extensions.injectable";
import { buildVersionInitializable } from "../../../../../vars/build-version/common/token";

const showAboutInjectable = getInjectable({
  id: "show-about",

  instantiate: (di) => {
    const buildVersion = di.inject(buildVersionInitializable.stateToken);
    const extensionApiVersion = di.inject(extensionApiVersionInjectable);
    const showMessagePopup = di.inject(showMessagePopupInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const appName = di.inject(appNameInjectable);
    const productName = di.inject(productNameInjectable);
    const applicationCopyright = di.inject(applicationCopyrightInjectable);
    const specificVersions = di.inject(specificVersionsInjectable);

    return () => {
      const appInfo = [
        `${appName}: ${buildVersion}`,
        `Extension API: ${extensionApiVersion}`,
        `Electron: ${process.versions.electron}`,
        `Chrome: ${process.versions.chrome}`,
        `Node: ${process.versions.node}`,
        applicationCopyright,
      ];

      if (specificVersions.length > 0) {
        appInfo.push(
          "",
          "",
          ...specificVersions,
        );
      }

      showMessagePopup(
        `${isWindows ? " ".repeat(2) : ""}${appName}`,
        productName,
        appInfo.join("\r\n"),
        {
          textWidth: specificVersions.length > 0
            ? 300
            : undefined,
        },
      );
    };
  },
});

export default showAboutInjectable;
