/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "@lensapp/app-paths";

const directoryForTempInjectable = getInjectable({
  id: "directory-for-temp",
  instantiate: (di) => di.inject(appPathsInjectionToken).temp,
});

export default directoryForTempInjectable;
