/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from 'react';
import { getInjectable } from "@ogre-tools/injectable";
import { clusterOverviewUIBlockInjectionToken } from "@k8slens/metrics";

const uiBlock = getInjectable({
  id: "lol",

  instantiate: () => ({
    id: "lol-id",
    text: "lol-1",
    Component: () => <div>Trollollol</div>,
  }),

  injectionToken: clusterOverviewUIBlockInjectionToken,
});

export default uiBlock;
