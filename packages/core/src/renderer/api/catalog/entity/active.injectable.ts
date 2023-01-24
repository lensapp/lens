/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import catalogEntityRegistryInjectable from "./registry.injectable";

const activeEntityInjectable = getInjectable({
  id: "active-entity",
  instantiate: (di) => {
    const registry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => registry.activeEntity);
  },
});

export default activeEntityInjectable;
