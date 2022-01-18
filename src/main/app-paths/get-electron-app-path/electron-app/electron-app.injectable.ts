/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { app } from "electron";

const electronAppInjectable = getInjectable({
  instantiate: () => app,
  lifecycle: lifecycleEnum.singleton,
  causesSideEffects: true,
});

export default electronAppInjectable;
