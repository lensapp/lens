/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isWindows } from "../vars";

const isWindowsInjectable = getInjectable({
  id: "is-windows",
  instantiate: () => isWindows,
  causesSideEffects: true,
});

export default isWindowsInjectable;
