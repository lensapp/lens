/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock/store.injectable";

const closeAllDockTabsInjectable = getInjectable({
  instantiate: (di) => di.inject(dockStoreInjectable).closeAllTabs,
  lifecycle: lifecycleEnum.singleton,
});

export default closeAllDockTabsInjectable;
