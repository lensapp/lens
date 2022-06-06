/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "../../common/path/get-absolute-path.injectable";
import staticFilesDirectoryInjectable from "../../common/vars/static-files-directory.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";

const trayIconPathsInjectable = getInjectable({
  id: "tray-icon-paths",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const baseIconDirectory = getAbsolutePath(
      staticFilesDirectory,
      isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    );

    return {
      normal: getAbsolutePath(baseIconDirectory, "trayIconTemplate.png"),
      updateAvailable: getAbsolutePath(baseIconDirectory, "trayIconUpdateAvailableTemplate.png"),
    };
  },
});

export default trayIconPathsInjectable;
