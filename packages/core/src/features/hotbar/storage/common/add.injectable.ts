/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { CreateHotbarData, CreateHotbarOptions } from "./types";
import activeHotbarIdInjectable from "./active-id.injectable";
import hotbarsStateInjectable from "./state.injectable";
import createHotbarInjectable from "./create-hotbar.injectable";

export type AddHotbar = (data: CreateHotbarData, { setActive }?: CreateHotbarOptions) => void;

const addHotbarInjectable = getInjectable({
  id: "add-hotbar",
  instantiate: (di): AddHotbar => {
    const state = di.inject(hotbarsStateInjectable);
    const activeHotbarId = di.inject(activeHotbarIdInjectable);
    const createHotbar = di.inject(createHotbarInjectable);

    return action((data, { setActive = false } = {}) => {
      const hotbar = createHotbar(data);

      state.set(hotbar.id, hotbar);

      if (setActive) {
        activeHotbarId.set(hotbar.id);
      }
    });
  },
});

export default addHotbarInjectable;
