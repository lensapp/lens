/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterOverviewUIBlockInjectionToken } from "@k8slens/metrics";

const uiBlock = getInjectable({
  id: "lol",
  instantiate: () => {
    return {
      id: "lol-id",
      text: "lol",
    };
  },
  injectionToken: clusterOverviewUIBlockInjectionToken,
});

export default uiBlock;
