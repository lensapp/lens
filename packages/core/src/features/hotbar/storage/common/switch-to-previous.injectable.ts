/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeHotbarIndexInjectable from "./active-hotbar-index.injectable";
import setAsActiveHotbarInjectable from "./set-as-active.injectable";
import hotbarsStateInjectable from "./state.injectable";

export type SwitchToPreviousHotbar = () => void;

const switchToPreviousHotbarInjectable = getInjectable({
  id: "switch-to-previous-hotbar",
  instantiate: (di): SwitchToPreviousHotbar => {
    const setAsActiveHotbar = di.inject(setAsActiveHotbarInjectable);
    const activeHotbarIndex = di.inject(activeHotbarIndexInjectable);
    const state = di.inject(hotbarsStateInjectable);

    return action(() => {
      const index = activeHotbarIndex.get() - 1;

      if (index < 0) {
        setAsActiveHotbar(state.size - 1);
      } else {
        setAsActiveHotbar(index);
      }
    });
  },
});

export default switchToPreviousHotbarInjectable;
