/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import addClusterInjectable from "../../features/cluster/storage/common/add.injectable";
import clustersInjectable from "../../features/cluster/storage/common/clusters.injectable";
import getClusterByIdInjectable from "../../features/cluster/storage/common/get-by-id.injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import clustersThatAreBeingDeletedInjectable from "./are-being-deleted.injectable";
import clusterConnectionInjectable from "./cluster-connection.injectable";
import { ClusterManager } from "./manager";
import updateEntityMetadataInjectable from "./update-entity-metadata.injectable";
import updateEntitySpecInjectable from "./update-entity-spec.injectable";
import visibleClusterInjectable from "./visible-cluster.injectable";

const clusterManagerInjectable = getInjectable({
  id: "cluster-manager",

  instantiate: (di) => new ClusterManager({
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
    clustersThatAreBeingDeleted: di.inject(clustersThatAreBeingDeletedInjectable),
    visibleCluster: di.inject(visibleClusterInjectable),
    logger: di.inject(loggerInjectionToken),
    addCluster: di.inject(addClusterInjectable),
    clusters: di.inject(clustersInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    updateEntityMetadata: di.inject(updateEntityMetadataInjectable),
    updateEntitySpec: di.inject(updateEntitySpecInjectable),
    getClusterConnection: (cluster) => di.inject(clusterConnectionInjectable, cluster),
  }),
});

export default clusterManagerInjectable;
