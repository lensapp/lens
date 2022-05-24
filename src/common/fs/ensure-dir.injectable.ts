/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const ensureDirInjectable = getInjectable({
  id: "ensure-dir",

  // TODO: Remove usages of ensureDir from business logic.
  // TODO: Read, Write, Watch etc. operations should do this internally.
  instantiate: (di) => di.inject(fsInjectable).ensureDir,

  causesSideEffects: true,
});

export default ensureDirInjectable;
