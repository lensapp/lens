/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForBinariesInjectable, { initDirectoryForBinariesOnMainInjectable, initDirectoryForBinariesOnRendererInjectable } from "./directory-for-binaries.injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import { createDependentInitializableState } from "../initializable-state/create";

const {
  value: directoryForKubectlBinariesInjectable,
  initializers: [
    initDirectoryForKubectlBinariesOnMainInjectable,
    initDirectoryForKubectlBinariesOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-kubectl-binaries",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForBinaries = di.inject(directoryForBinariesInjectable);

    return joinPaths(directoryForBinaries.get(), "kubectl");
  },
  initAfter: [
    initDirectoryForBinariesOnMainInjectable,
    initDirectoryForBinariesOnRendererInjectable,
  ],
});

export {
  initDirectoryForKubectlBinariesOnMainInjectable,
  initDirectoryForKubectlBinariesOnRendererInjectable,
};

export default directoryForKubectlBinariesInjectable;
