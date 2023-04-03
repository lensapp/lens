/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { iter } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { action } from "mobx";
import activeHotbarIdInjectable from "./active-id.injectable";
import type { Hotbar } from "./hotbar";
import hotbarsStateInjectable from "./state.injectable";

export type RemoveHotbar = (hotbar: Hotbar) => void;

const removeHotbarInjectable = getInjectable({
  id: "remove-hotbar",
  instantiate: (di): RemoveHotbar => {
    const state = di.inject(hotbarsStateInjectable);
    const activeHotbarId = di.inject(activeHotbarIdInjectable);

    return action((hotbar) => {
      assert(state.size >= 2, "Cannot remove the last hotbar");

      state.delete(hotbar.id);

      if (activeHotbarId.get() === hotbar.id) {
        activeHotbarId.set(iter.first(state.values())?.id);
      }
    });
  },
});

export default removeHotbarInjectable;
