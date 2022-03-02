/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { catalogEntityRegistry } from "../catalog-entity-registry";

const catalogEntityRegistryInjectable = getInjectable({
  id: "catalog-entity-registry",
  instantiate: () => catalogEntityRegistry,
});

export default catalogEntityRegistryInjectable;
