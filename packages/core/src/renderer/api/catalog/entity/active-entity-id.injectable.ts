/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import catalogEntityRegistryInjectable from "./registry.injectable";

const activeEntityIdInjectable = getInjectable({
  id: "active-entity-id",
  instantiate: (di) => {
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => entityRegistry.activeEntity?.getId());
  },
});

export default activeEntityIdInjectable;
