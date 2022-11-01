/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable, { initDirectoryForUserDataOnMainInjectable, initDirectoryForUserDataOnRendererInjectable } from "../app-paths/directory-for-user-data.injectable";
import { createDependentInitializableState } from "../initializable-state/create";
import joinPathsInjectable from "../path/join-paths.injectable";

const {
  value: directoryForLensLocalStorageInjectable,
  initializers: [
    initDirectoryForLensLocalStorageOnMainInjectable,
    initDirectoryForLensLocalStorageOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-lens-local-storage",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "lens-local-storage");
  },
  initAfter: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
});

export {
  initDirectoryForLensLocalStorageOnMainInjectable,
  initDirectoryForLensLocalStorageOnRendererInjectable,
};

export default directoryForLensLocalStorageInjectable;
