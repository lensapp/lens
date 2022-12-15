/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const readJsonSyncInjectable = getInjectable({
  id: "read-json-sync",
  instantiate: (di) => di.inject(fsInjectable).readJsonSync,
});

export default readJsonSyncInjectable;
