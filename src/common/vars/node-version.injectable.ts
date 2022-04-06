/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const nodeVersionInjectable = getInjectable({
  id: "node-version",
  instantiate: () => process.versions.node,
  causesSideEffects: true,
});

export default nodeVersionInjectable;
