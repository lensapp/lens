/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeHotbarIndexInjectable from "./active-hotbar-index.injectable";
import setAsActiveHotbarInjectable from "./set-as-active.injectable";
import hotbarsStateInjectable from "./state.injectable";

export type SwitchToNextHotbar = () => void;

const switchToNextHotbarInjectable = getInjectable({
  id: "switch-to-next-hotbar",
  instantiate: (di): SwitchToNextHotbar => {
    const setAsActiveHotbar = di.inject(setAsActiveHotbarInjectable);
    const activeHotbarIndex = di.inject(activeHotbarIndexInjectable);
    const state = di.inject(hotbarsStateInjectable);

    return action(() => {
      const index = activeHotbarIndex.get() + 1;

      if (index >= state.size) {
        setAsActiveHotbar(0);
      } else {
        setAsActiveHotbar(index);
      }
    });
  },
});

export default switchToNextHotbarInjectable;
