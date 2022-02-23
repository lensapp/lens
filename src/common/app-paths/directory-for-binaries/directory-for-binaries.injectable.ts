/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import { isDevelopment, contextDir } from "../../vars";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";

const directoryForBinariesInjectable = getInjectable({
  instantiate: (di) => {
    if (isDevelopment) {
      return path.join(contextDir, "binaries");
    }

    return path.join(di.inject(directoryForUserDataInjectable), "binaries");
  },
  lifecycle: lifecycleEnum.singleton,
});

export default directoryForBinariesInjectable;
