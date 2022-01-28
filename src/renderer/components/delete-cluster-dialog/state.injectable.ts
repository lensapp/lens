/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Cluster } from "../../../common/cluster/cluster";

export interface DeleteClusterDialogState {
  config?: KubeConfig;
  cluster?: Cluster;
}

const deleteClusterDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<DeleteClusterDialogState>({}),
  lifecycle: lifecycleEnum.singleton,
});

export default deleteClusterDialogStateInjectable;
