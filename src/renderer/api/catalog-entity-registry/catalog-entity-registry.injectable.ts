/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { catalogEntityRegistry } from "../catalog-entity-registry";

const catalogEntityRegistryInjectable = getInjectable({
  instantiate: () => catalogEntityRegistry,
  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntityRegistryInjectable;
