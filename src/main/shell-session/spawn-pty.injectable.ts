/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { spawn } from "node-pty";

const spawnPtyInjectable = getInjectable({
  id: "spawn-pty",
  instantiate: () => spawn,
  causesSideEffects: true,
});

export default spawnPtyInjectable;
