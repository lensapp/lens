/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForBinariesInjectable from "../directory-for-binaries.injectable";
import joinPathsInjectable from "../../path/join-paths.injectable";
import { createLazyInitializableState } from "../../initializable-state/create-lazy";

const directoryForKubectlBinariesInjectable = createLazyInitializableState({
  id: "directory-for-kubectl-binaries",

  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForBinaries = di.inject(directoryForBinariesInjectable);

    return joinPaths(directoryForBinaries.get(), "kubectl");
  },
});

export default directoryForKubectlBinariesInjectable;
