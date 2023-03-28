/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clustersStateInjectable from "./state.injectable";

const clustersInjectable = getInjectable({
  id: "clusters",
  instantiate: (di) => {
    const clustersState = di.inject(clustersStateInjectable);

    return computed(() => [...clustersState.values()]);
  },
});

export default clustersInjectable;
