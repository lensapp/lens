/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logTabStoreInjectable from "./tab-store.injectable";

const updateTabNameInjectable = getInjectable({
  instantiate: (di) => di.inject(logTabStoreInjectable).updateTabName,
  lifecycle: lifecycleEnum.singleton,
});

export default updateTabNameInjectable;
