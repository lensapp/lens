/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { clusterFrameChildComponentInjectionToken } from "../../../frames/cluster-frame/cluster-frame-child-component-injection-token";
import { ReplicaSetScaleDialog } from "./dialog";

const replicasetScaleDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "replicaset-scale-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "replicaset-scale-dialog",
    shouldRender: computed(() => true),
    Component: ReplicaSetScaleDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,

  causesSideEffects: true,
});

export default replicasetScaleDialogClusterFrameChildComponentInjectable;
