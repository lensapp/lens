/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electron from "electron";

const electronInjectable = getInjectable({
  id: "electron",
  instantiate: () => electron,
  causesSideEffects: true,
});

export default electronInjectable;
