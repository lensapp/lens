/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import homeDirectoryPathInjectable from "../../../../common/os/home-directory-path.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";

const localExtensionsDirectoryPathInjectable = getInjectable({
  id: "local-extensions-directory-path",
  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const homeDirectoryPath = di.inject(homeDirectoryPathInjectable);

    return joinPaths(homeDirectoryPath, ".k8slens", "extensions");
  },
});

export default localExtensionsDirectoryPathInjectable;
