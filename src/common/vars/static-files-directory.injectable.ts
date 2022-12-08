/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../path/join-paths.injectable";

const staticFilesDirectoryInjectable = getInjectable({
  id: "static-files-directory",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);

    return joinPaths(__dirname, "..");
  },
});

export default staticFilesDirectoryInjectable;
