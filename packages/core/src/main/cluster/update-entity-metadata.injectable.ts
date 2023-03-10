/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { toJS } from "mobx";
import type { KubernetesCluster } from "../../common/catalog-entities";
import { ClusterMetadataKey } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import { enumKeys } from "../../common/utils/enum";

export type UpdateEntityMetadata = (entity: KubernetesCluster, cluster: Cluster) => void;

const updateEntityMetadataInjectable =  getInjectable({
  id: "update-entity-metadata",

  instantiate: (): UpdateEntityMetadata => {
    return (entity, cluster) => {
      entity.metadata.labels = {
        ...entity.metadata.labels,
        ...toJS(cluster.labels),
      };
      entity.metadata.distro = cluster.distribution.get();
      entity.metadata.kubeVersion = cluster.version.get();

      enumKeys(ClusterMetadataKey).forEach((key) => {
        const metadataKey = ClusterMetadataKey[key];

        entity.metadata[metadataKey] = cluster.metadata[metadataKey];
      });

      if (cluster.preferences?.clusterName) {
        /**
         * Only set the name if the it is overriden in preferences. If it isn't
         * set then the name of the entity has been explicitly set by its source
         */
        entity.metadata.name = cluster.preferences.clusterName;
      }
    };
  },
});

export default updateEntityMetadataInjectable;
