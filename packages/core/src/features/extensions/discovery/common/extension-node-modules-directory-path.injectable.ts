/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";

const extensionsNodeModulesDirectoryPathInjectable = getInjectable({
  id: "extensions-node-modules-directory-path",
  instantiate: (di) => {
    const directoryForUserData = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return joinPaths(directoryForUserData, "node_modules");
  },
});

export default extensionsNodeModulesDirectoryPathInjectable;
