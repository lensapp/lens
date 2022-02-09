/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

const fsInjectable = getInjectable({
  id: "fs",
  instantiate: () => fse,
  causesSideEffects: true,
});

export default fsInjectable;
