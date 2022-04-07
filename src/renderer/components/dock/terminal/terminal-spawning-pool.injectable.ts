/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";

const terminalSpawningPoolInjectable = getInjectable({
  id: "terminal-spawning-pool",
  instantiate: () => {
    const pool = document.getElementById("terminal-init");

    assert(pool, "DOM MUST container #terminal-init element");

    return pool;
  },
  causesSideEffects: true,
});

export default terminalSpawningPoolInjectable;
