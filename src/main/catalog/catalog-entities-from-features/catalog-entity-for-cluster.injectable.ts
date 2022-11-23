/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "@lensapp/cluster";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import {
  KubernetesCluster,
  LensKubernetesClusterStatus,
} from "../../../common/catalog-entities";

const catalogEntityForClusterInjectable = getInjectable({
  id: "catalog-entity-for-cluster",

  instantiate: (di, cluster: Cluster) =>
    new KubernetesCluster({
      metadata: {
        uid: cluster.id,
        name: cluster.name,
        source: cluster.source,
        labels: cluster.labels,
        distro: cluster.distribution,
        kubeVersion: cluster.version,
      },

      spec: {
        kubeconfigPath: cluster.kubeconfigPath,
        kubeconfigContext: cluster.contextName,
      },

      status: {
        phase: LensKubernetesClusterStatus.DISCONNECTED,
      },
    }),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default catalogEntityForClusterInjectable;
