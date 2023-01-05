/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { clusterFrameChildComponentInjectionToken } from "../../frames/cluster-frame/cluster-frame-child-component-injection-token";
import { KubeConfigDialog } from "./kubeconfig-dialog";

const kubeconfigDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "kubeconfig-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "kubeconfig-dialog",
    shouldRender: computed(() => true),
    Component: KubeConfigDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,

  causesSideEffects: true,
});

export default kubeconfigDialogClusterFrameChildComponentInjectable;
