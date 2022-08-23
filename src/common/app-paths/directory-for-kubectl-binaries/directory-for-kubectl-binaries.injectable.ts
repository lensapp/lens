/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForBinariesInjectable from "../directory-for-binaries/directory-for-binaries.injectable";
import getAbsolutePathInjectable from "../../path/get-absolute-path.injectable";

const directoryForKubectlBinariesInjectable = getInjectable({
  id: "directory-for-kubectl-binaries",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const directoryForBinaries = di.inject(directoryForBinariesInjectable);


    return getAbsolutePath(directoryForBinaries, "kubectl");
  },
});

export default directoryForKubectlBinariesInjectable;
