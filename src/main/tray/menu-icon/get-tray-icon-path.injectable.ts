/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";
import staticFilesDirectoryInjectable from "../../../common/vars/static-files-directory.injectable";
import isDevelopmentInjectable from "../../../common/vars/is-development.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import { camelCase, flow, upperFirst } from "lodash/fp";
const upperCamelCase = flow(camelCase, upperFirst);

const getTrayIconPathInjectable = getInjectable({
  id: "get-tray-icon-path",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const isMac = di.inject(isMacInjectable);

    const baseIconDirectory = getAbsolutePath(
      staticFilesDirectory,
      isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    );

    const fileSuffix = isMac ? "Template.png" : ".png";

    return (name: string) =>
      getAbsolutePath(
        baseIconDirectory,
        `trayIcon${upperCamelCase(name)}${fileSuffix}`,
      );
  },
});

export default getTrayIconPathInjectable;
