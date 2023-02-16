/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import preinstallingPhasesInjectable from "./preinstalling.injectable";

const extensionsPreinstallingCountInjectable = getInjectable({
  id: "extensions-preinstalling-count",
  instantiate: (di) => {
    const preinstallingPhases = di.inject(preinstallingPhasesInjectable);

    return computed(() => preinstallingPhases.size);
  },
});

export default extensionsPreinstallingCountInjectable;
