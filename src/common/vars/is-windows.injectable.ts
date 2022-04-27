/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isWindowsInjectable = getInjectable({
  id: "is-windows",
  instantiate: () => process.platform === "win32",
  causesSideEffects: true,
});

export default isWindowsInjectable;
