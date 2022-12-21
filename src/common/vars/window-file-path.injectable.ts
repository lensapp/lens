/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import appNameInjectable from "./app-name.injectable";
import staticFilesDirectoryInjectable from "./static-files-directory.injectable";

const windowFilePathInjectable = getInjectable({
  id: "window-file-path",
  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const applicationName = di.inject(appNameInjectable);

    return joinPaths(staticFilesDirectory, "build", `${applicationName}.html`);
  },
});

export default windowFilePathInjectable;
