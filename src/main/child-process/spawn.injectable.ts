/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { spawn } from "child_process";

const spawnInjectable = getInjectable({
  id: "spawn",

  instantiate: () => {
    return spawn;
  },
  causesSideEffects: true,
});

export default spawnInjectable;
