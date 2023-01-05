/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForBinariesInjectable from "../directory-for-binaries/directory-for-binaries.injectable";
import joinPathsInjectable from "../../path/join-paths.injectable";

const directoryForKubectlBinariesInjectable = getInjectable({
  id: "directory-for-kubectl-binaries",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForBinaries = di.inject(directoryForBinariesInjectable);

    return joinPaths(directoryForBinaries, "kubectl");
  },
});

export default directoryForKubectlBinariesInjectable;
