/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsInjectable from "../app-paths.injectable";

const directoryForExesInjectable = getInjectable({
  id: "directory-for-exes",
  instantiate: (di) => di.inject(appPathsInjectable).exe,
});

export default directoryForExesInjectable;
