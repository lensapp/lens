/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { app } from "electron";

const electronAppInjectable = getInjectable({
  id: "electron-app",
  instantiate: () => app,
  causesSideEffects: true,
});

export default electronAppInjectable;
