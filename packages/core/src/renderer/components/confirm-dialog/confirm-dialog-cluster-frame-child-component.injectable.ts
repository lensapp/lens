/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { ConfirmDialog } from "./confirm-dialog";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";

const confirmDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "confirm-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "confirm-dialog",
    shouldRender: computed(() => true),
    Component: ConfirmDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default confirmDialogClusterFrameChildComponentInjectable;
