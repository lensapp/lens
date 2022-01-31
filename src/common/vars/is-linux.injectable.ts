/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { isLinux } from "../vars";

const isLinuxInjectable = getInjectable({
  instantiate: () => isLinux,
  lifecycle: lifecycleEnum.singleton,
});

export default isLinuxInjectable;
