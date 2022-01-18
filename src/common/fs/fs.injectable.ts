/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import fse from "fs-extra";

const fsInjectable = getInjectable({
  instantiate: () => fse,
  causesSideEffects: true,
  lifecycle: lifecycleEnum.singleton,
});

export default fsInjectable;
