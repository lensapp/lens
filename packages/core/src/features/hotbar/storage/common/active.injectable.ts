/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import activeHotbarIdInjectable from "./active-id.injectable";
import hotbarsStateInjectable from "./state.injectable";

const activeHotbarInjectable = getInjectable({
  id: "active-hotbar",
  instantiate: (di) => {
    const state = di.inject(hotbarsStateInjectable);
    const activeHotbarId = di.inject(activeHotbarIdInjectable);

    return computed(() => {
      const id = activeHotbarId.get();

      return (id && state.get(id)) || undefined;
    });
  },
});

export default activeHotbarInjectable;
