/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";

const entitiesInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogEntityRegistryInjectable).computedItems,
  lifecycle: lifecycleEnum.singleton,
});

export default entitiesInjectable;
