/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable, { initDirectoryForUserDataOnMainInjectable, initDirectoryForUserDataOnRendererInjectable } from "./directory-for-user-data.injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import { createDependentInitializableState } from "../initializable-state/create-dependent";

const {
  value: directoryForBinariesInjectable,
  initializers: [
    initDirectoryForBinariesOnMainInjectable,
    initDirectoryForBinariesOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-binaries",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "binaries");
  },
  initAfter: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
});

export {
  initDirectoryForBinariesOnMainInjectable,
  initDirectoryForBinariesOnRendererInjectable,
};

export default directoryForBinariesInjectable;
