/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { isWindows } from "../vars";

const isWindowsInjectable = getInjectable({
  instantiate: () => isWindows,
  lifecycle: lifecycleEnum.singleton,
});

export default isWindowsInjectable;
