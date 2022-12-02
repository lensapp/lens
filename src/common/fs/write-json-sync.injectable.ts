/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const writeJsonSyncInjectable = getInjectable({
  id: "write-json-sync",
  instantiate: (di) => di.inject(fsInjectable).writeJsonSync,
});

export default writeJsonSyncInjectable;
