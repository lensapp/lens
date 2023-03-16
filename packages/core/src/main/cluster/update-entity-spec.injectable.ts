/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubernetesCluster, KubernetesClusterPrometheusMetrics } from "../../common/catalog-entities";
import type { Cluster } from "../../common/cluster/cluster";

export type UpdateEntitySpec = (entity: KubernetesCluster, cluster: Cluster) => void;

const updateEntitySpecInjectable = getInjectable({
  id: "update-entity-spec",

  instantiate: (): UpdateEntitySpec => {
    return (entity, cluster) => {
      entity.spec.metrics ||= { source: "local" };

      if (entity.spec.metrics.source === "local") {
        const prometheus: KubernetesClusterPrometheusMetrics = entity.spec?.metrics?.prometheus || {};

        prometheus.type = cluster.preferences.prometheusProvider?.type;
        prometheus.address = cluster.preferences.prometheus;
        entity.spec.metrics.prometheus = prometheus;
      }

      entity.spec.icon ??= {};

      if (cluster.preferences.iconBackgroundColor) {
        entity.spec.icon.background = cluster.preferences.iconBackgroundColor;
      }

      if (cluster.preferences.icon) {
        entity.spec.icon.src = cluster.preferences.icon;
        entity.spec.icon.background = cluster.preferences.iconBackgroundColor;
      } else if (cluster.preferences.icon === null) {
        /**
         * NOTE: only clear the icon if set to `null` by ClusterIconSettings.
         * We can then also clear that value too
         */
        entity.spec.icon = undefined;
        cluster.preferences.icon = undefined;
      }
    };
  },
});

export default updateEntitySpecInjectable;
