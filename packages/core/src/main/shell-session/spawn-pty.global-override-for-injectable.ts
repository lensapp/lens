/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import spawnPtyInjectable from "./spawn-pty.injectable";

export default getGlobalOverride(spawnPtyInjectable, () => () => {
  throw new Error("Tried to spawn a PTY without an override");
});
