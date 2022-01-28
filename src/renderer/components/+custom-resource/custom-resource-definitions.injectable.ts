/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import customResourceDefinitionStoreInjectable from "./store.injectable";

const customResourceDefinitionsInjectable = getInjectable({
  instantiate: (di) => di.inject(customResourceDefinitionStoreInjectable).computedItems,
  lifecycle: lifecycleEnum.singleton,
});

export default customResourceDefinitionsInjectable;
