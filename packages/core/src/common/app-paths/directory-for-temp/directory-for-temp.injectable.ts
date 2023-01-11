/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsInjectable from "../app-paths.injectable";

const directoryForTempInjectable = getInjectable({
  id: "directory-for-temp",
  instantiate: (di) => di.inject(appPathsInjectable).temp,
});

export default directoryForTempInjectable;
