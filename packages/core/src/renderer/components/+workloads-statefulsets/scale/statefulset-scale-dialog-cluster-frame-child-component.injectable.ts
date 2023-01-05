/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { StatefulSetScaleDialog } from "./dialog";
import { clusterFrameChildComponentInjectionToken } from "../../../frames/cluster-frame/cluster-frame-child-component-injection-token";

const statefulsetScaleDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "statefulset-scale-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "statefulset-scale-dialog",
    shouldRender: computed(() => true),
    Component: StatefulSetScaleDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,

  causesSideEffects: true,
});

export default statefulsetScaleDialogClusterFrameChildComponentInjectable;
