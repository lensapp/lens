/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "./store.injectable";

const removeAllHotbarItemsInjectable = getInjectable({
  instantiate: (di) => di.inject(hotbarStoreInjectable).removeAllHotbarItems,
  lifecycle: lifecycleEnum.singleton,
});

export default removeAllHotbarItemsInjectable;
