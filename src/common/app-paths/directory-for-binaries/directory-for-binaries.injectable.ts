/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import isDevelopmentInjectable from "../../vars/is-development.injectable";
import contextDirInjectable from "../../vars/context-dir.injectable";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";

const directoryForBinariesInjectable = getInjectable({
  instantiate: (di) => {
    if (di.inject(isDevelopmentInjectable)) {
      return path.join(di.inject(contextDirInjectable), "binaries");
    }

    return path.join(di.inject(directoryForUserDataInjectable), "binaries");
  },
  lifecycle: lifecycleEnum.singleton,
});

export default directoryForBinariesInjectable;
