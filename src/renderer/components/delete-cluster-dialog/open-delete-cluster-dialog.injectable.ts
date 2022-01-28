/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { Cluster } from "../../../common/cluster/cluster";
import { bind } from "../../utils";
import deleteClusterDialogStateInjectable, { DeleteClusterDialogState } from "./state.injectable";

interface Dependencies {
  state: DeleteClusterDialogState;
}

const openDeleteClusterDialog = action(({ state }: Dependencies, cluster: Cluster, config: KubeConfig): void => {
  state.cluster = cluster;
  state.config = config;
});

const openDeleteClusterDialogInjectable = getInjectable({
  instantiate: (di) => bind(openDeleteClusterDialog, null, {
    state: di.inject(deleteClusterDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openDeleteClusterDialogInjectable;
