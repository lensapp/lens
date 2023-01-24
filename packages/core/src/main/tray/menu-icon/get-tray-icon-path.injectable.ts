/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import staticFilesDirectoryInjectable from "../../../common/vars/static-files-directory.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import { camelCase, flow, upperFirst } from "lodash/fp";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
const upperCamelCase = flow(camelCase, upperFirst);

const getTrayIconPathInjectable = getInjectable({
  id: "get-tray-icon-path",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const isMac = di.inject(isMacInjectable);

    const baseIconDirectory = joinPaths(
      staticFilesDirectory,
      "build/tray",
    );

    const fileSuffix = isMac ? "Template.png" : ".png";

    return (name: string) => joinPaths(
      baseIconDirectory,
      `trayIcon${upperCamelCase(name)}${fileSuffix}`,
    );
  },
});

export default getTrayIconPathInjectable;
