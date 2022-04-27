/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isLinuxInjectable = getInjectable({
  id: "is-linux",
  instantiate: () => process.platform === "linux",
  causesSideEffects: true,
});

export default isLinuxInjectable;
