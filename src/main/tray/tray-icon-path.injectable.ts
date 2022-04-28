/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "../../common/path/get-absolute-path.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import staticFilesDirectoryInjectable from "../../common/vars/static-files-directory.injectable";

const trayIconPathInjectable = getInjectable({
  id: "tray-icon-path",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const staticDir = di.inject(staticFilesDirectoryInjectable);

    return getAbsolutePath(
      staticDir,
      isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
      "trayIconTemplate.png",
    );
  },
});

export default trayIconPathInjectable;
