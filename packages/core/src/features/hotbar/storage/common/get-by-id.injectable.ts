/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Hotbar } from "./hotbar";
import hotbarsStateInjectable from "./state.injectable";

export type GetHotbarById = (id: string) => Hotbar | undefined;

const getHotbarByIdInjectable = getInjectable({
  id: "get-hotbar-by-id",
  instantiate: (di): GetHotbarById => {
    const state = di.inject(hotbarsStateInjectable);

    return (id) => state.get(id);
  },
});

export default getHotbarByIdInjectable;
