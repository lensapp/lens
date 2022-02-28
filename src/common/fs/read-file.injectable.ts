/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const readFileInjectable = getInjectable({
  id: "read-file",
  instantiate: (di) => di.inject(fsInjectable).readFile,
});

export default readFileInjectable;
