/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import lensResourcesDirInjectable from "./lens-resources-dir.injectable";

const developmentBundledLibrariesDirectoryInjectable = getInjectable({
  id: "development-bundled-libraries-directory",
  instantiate: (di) => {
    const lensResourcesDir = di.inject(lensResourcesDirInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return joinPaths(lensResourcesDir, "build", "webpack");
  },
});

export default developmentBundledLibrariesDirectoryInjectable;
