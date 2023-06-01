/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { DeleteClusterDialog } from "./view";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";

const deleteClusterDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "delete-cluster-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "delete-cluster-dialog",
    shouldRender: computed(() => true),
    Component: DeleteClusterDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default deleteClusterDialogClusterFrameChildComponentInjectable;
