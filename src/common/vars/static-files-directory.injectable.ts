/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import lensResourcesDirInjectable from "./lens-resources-dir.injectable";

const staticFilesDirectoryInjectable = getInjectable({
  id: "static-files-directory",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const lensResourcesDir = di.inject(lensResourcesDirInjectable);

    return joinPaths(lensResourcesDir, "static");
  },
});

export default staticFilesDirectoryInjectable;
