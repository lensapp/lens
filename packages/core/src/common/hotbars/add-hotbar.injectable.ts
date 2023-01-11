/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "./store.injectable";
import type { CreateHotbarData, CreateHotbarOptions } from "./types";

export type AddHotbar = (data: CreateHotbarData, opts?: CreateHotbarOptions) => void;

const addHotbarInjectable = getInjectable({
  id: "add-hotbar",
  instantiate: (di): AddHotbar => {
    const store = di.inject(hotbarStoreInjectable);

    return (data, opts) => store.add(data, opts);
  },
});

export default addHotbarInjectable;
