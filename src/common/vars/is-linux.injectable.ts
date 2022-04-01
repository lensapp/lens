/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isLinux } from "../vars";

const isLinuxInjectable = getInjectable({
  id: "is-linux",
  instantiate: () => isLinux,
  causesSideEffects: true,
});

export default isLinuxInjectable;
