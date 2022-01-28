/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "./store.injectable";

const createNewHotbarInjectable = getInjectable({
  instantiate: (di) => di.inject(hotbarStoreInjectable).add,
  lifecycle: lifecycleEnum.singleton,
});

export default createNewHotbarInjectable;
