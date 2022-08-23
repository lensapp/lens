/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { spawn } from "child_process";

export type Spawn = typeof spawn;

const spawnInjectable = getInjectable({
  id: "spawn",

  instantiate: (): Spawn => spawn,
  causesSideEffects: true,
});

export default spawnInjectable;
