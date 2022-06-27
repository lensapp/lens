/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { PortForwardDialog } from "./port-forward-dialog";
import { clusterFrameChildComponentInjectionToken } from "../frames/cluster-frame/cluster-frame-child-component-injection-token";

const portForwardDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "port-forward-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "port-forward-dialog",
    shouldRender: computed(() => true),
    Component: PortForwardDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,

  causesSideEffects: true,
});

export default portForwardDialogClusterFrameChildComponentInjectable;
