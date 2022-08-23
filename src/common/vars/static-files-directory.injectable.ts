/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "../path/get-absolute-path.injectable";
import lensResourcesDirInjectable from "./lens-resources-dir.injectable";

const staticFilesDirectoryInjectable = getInjectable({
  id: "static-files-directory",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const lensResourcesDir = di.inject(lensResourcesDirInjectable);

    return getAbsolutePath(lensResourcesDir, "static");
  },
});

export default staticFilesDirectoryInjectable;
