/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { KubernetesCluster, LensKubernetesClusterStatus } from "../../../common/catalog-entities";
import type { ClusterDto } from "./clusters.injectable";

const catalogEntityForClusterInjectable = getInjectable({
  id: "catalog-entity-for-cluster",

  instantiate: (di, cluster: ClusterDto) =>
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
    getInstanceKey: (di, cluster: ClusterDto) => cluster.id,
  }),
});

export default catalogEntityForClusterInjectable;
