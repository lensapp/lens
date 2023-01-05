/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import joinPathsInjectable from "../path/join-paths.injectable";

const directoryForLensLocalStorageInjectable = getInjectable({
  id: "directory-for-lens-local-storage",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(
      directoryForUserData,
      "lens-local-storage",
    );
  },
});

export default directoryForLensLocalStorageInjectable;
