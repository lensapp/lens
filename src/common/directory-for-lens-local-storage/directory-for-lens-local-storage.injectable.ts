/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data.injectable";
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import joinPathsInjectable from "../path/join-paths.injectable";

const directoryForLensLocalStorageInjectable = createLazyInitializableState({
  id: "directory-for-lens-local-storage",

  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "lens-local-storage");
  },
});

export default directoryForLensLocalStorageInjectable;
