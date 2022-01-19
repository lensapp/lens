/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForBinariesInjectable from "../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import path from "path";

const directoryForKubectlBinariesInjectable = getInjectable({
  instantiate: (di) =>
    path.join(di.inject(directoryForBinariesInjectable), "kubectl"),
  
  lifecycle: lifecycleEnum.singleton,
});

export default directoryForKubectlBinariesInjectable;
