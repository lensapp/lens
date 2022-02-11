/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";

const catalogEntitiesInjectable = getInjectable({
  instantiate: (di) => {
    const registry = di.inject(catalogEntityRegistryInjectable);

    return registry.entities;
  },
  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntitiesInjectable;
