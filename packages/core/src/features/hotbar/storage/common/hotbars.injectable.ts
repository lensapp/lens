/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import hotbarsStateInjectable from "./state.injectable";

const hotbarsInjectable = getInjectable({
  id: "hotbars",
  instantiate: (di) => {
    const state = di.inject(hotbarsStateInjectable);

    return computed(() => [...state.values()]);
  },
});

export default hotbarsInjectable;
