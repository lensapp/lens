/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import activeHotbarIdInjectable from "./active-id.injectable";
import computeHotbarIndexInjectable from "./compute-hotbar-index.injectable";

const activeHotbarIndexInjectable = getInjectable({
  id: "active-hotbar-index",
  instantiate: (di) => {
    const computeHotbarIndex = di.inject(computeHotbarIndexInjectable);
    const activeHotbarId = di.inject(activeHotbarIdInjectable);

    return computed(() => {
      const activeId = activeHotbarId.get();

      return (activeId && computeHotbarIndex(activeId)) || 0;
    });
  },
});

export default activeHotbarIndexInjectable;
