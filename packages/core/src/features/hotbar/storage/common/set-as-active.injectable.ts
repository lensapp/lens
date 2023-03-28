/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { iter } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeHotbarIdInjectable from "./active-id.injectable";
import type { Hotbar } from "./hotbar";
import hotbarsStateInjectable from "./state.injectable";

export type SetAsActiveHotbar = (desc: Hotbar | number | string) => void;

const setAsActiveHotbarInjectable = getInjectable({
  id: "set-as-active-hotbar",
  instantiate: (di): SetAsActiveHotbar => {
    const hotbarsState = di.inject(hotbarsStateInjectable);
    const activeHotbarId = di.inject(activeHotbarIdInjectable);

    return action((desc) => {
      if (typeof desc === "number") {
        const hotbar = iter.nth(hotbarsState.values(), desc);

        if (hotbar) {
          activeHotbarId.set(hotbar.id);
        }
      } else if (typeof desc === "string") {
        if (hotbarsState.has(desc)) {
          activeHotbarId.set(desc);
        }
      } else {
        if (hotbarsState.has(desc.id)) {
          activeHotbarId.set(desc.id);
        }
      }
    });
  },
});

export default setAsActiveHotbarInjectable;
