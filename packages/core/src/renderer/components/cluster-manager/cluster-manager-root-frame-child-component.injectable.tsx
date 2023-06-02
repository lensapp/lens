/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { rootFrameChildComponentInjectionToken } from "@k8slens/react-application";
import { ClusterManager } from "./cluster-manager";
import { computed } from "mobx";
import { ErrorBoundary } from "@k8slens/error-boundary";

const clusterManagerRootFrameChildComponentInjectable = getInjectable({
  id: "cluster-manager-root-frame-child-component",

  instantiate: () => ({
    id: "cluster-manager",

    shouldRender: computed(() => true),

    Component: () => (
      <ErrorBoundary>
        <ClusterManager />
      </ErrorBoundary>
    ),
  }),

  injectionToken: rootFrameChildComponentInjectionToken,
});

export default clusterManagerRootFrameChildComponentInjectable;
