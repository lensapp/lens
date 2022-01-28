/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import windowManagerInjectable from "./manager.injectable";

const ensureMainWindowInjectable = getInjectable({
  instantiate: (di) => di.inject(windowManagerInjectable).ensureMainWindow,
  lifecycle: lifecycleEnum.singleton,
});

export default ensureMainWindowInjectable;
