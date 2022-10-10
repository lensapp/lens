/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { clusterFrameChildComponentInjectionToken } from "../frames/cluster-frame/cluster-frame-child-component-injection-token";
import { ClusterModals } from "./cluster-modals";

const clusterModalsClusterFrameChildComponentInjectable = getInjectable({
  id: "cluster-modals-cluster-frame-child-component",

  instantiate: () => ({
    id: "cluster-modals",
    shouldRender: computed(() => true),
    Component: ClusterModals,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default clusterModalsClusterFrameChildComponentInjectable;
