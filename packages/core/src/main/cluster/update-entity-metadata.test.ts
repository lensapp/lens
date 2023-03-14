/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AppPaths } from "../../common/app-paths/app-path-injection-token";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { KubernetesCluster } from "../../common/catalog-entities";
import { ClusterMetadataKey } from "../../common/cluster-types";
import { Cluster } from "../../common/cluster/cluster";
import { replaceObservableObject } from "../../common/utils/replace-observable-object";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { UpdateEntityMetadata } from "./update-entity-metadata.injectable";
import updateEntityMetadataInjectable from "./update-entity-metadata.injectable";

describe("update-entity-metadata", () => {
  let cluster: Cluster;
  let entity: KubernetesCluster;
  let updateEntityMetadata: UpdateEntityMetadata;
  let detectedMetadata: Record<ClusterMetadataKey, any>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(appPathsStateInjectable, () => ({
      get: () => ({} as AppPaths),
      set: () => {},
    }));

    updateEntityMetadata = di.inject(updateEntityMetadataInjectable);

    cluster = new Cluster({
      id: "some-id",
      contextName: "some-context",
      kubeConfigPath: "minikube-config.yml",
    });

    detectedMetadata = {
      [ClusterMetadataKey.CLUSTER_ID]: "some-cluster-id",
      [ClusterMetadataKey.DISTRIBUTION]: "some-distribution",
      [ClusterMetadataKey.VERSION]: "some-version",
      [ClusterMetadataKey.LAST_SEEN]: "some-date",
      [ClusterMetadataKey.NODES_COUNT]: 42,
      [ClusterMetadataKey.PROMETHEUS]: {
        "some-parameter": "some-value",
      },
    };

    entity = new KubernetesCluster({
      metadata: {
        uid: "some-uid",
        name: "some-name",
        labels: {},
      },
      spec: {
        kubeconfigContext: "some-context",
        kubeconfigPath: "/some/path/to/kubeconfig",
      },
      status: {
        phase: "connecting",
      },
    });
  });

  it("given cluster metadata has no some last seen timestamp, does not update entity metadata with last seen timestamp", () => {
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.lastSeen).toEqual(undefined);
  });

  it("given cluster metadata has some last seen timestamp, updates entity metadata with last seen timestamp", () => {
    cluster.metadata[ClusterMetadataKey.LAST_SEEN] = detectedMetadata[ClusterMetadataKey.LAST_SEEN];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.lastSeen).toEqual("some-date");
  });

  it("given cluster metadata has some version, updates entity metadata with version", () => {
    cluster.metadata[ClusterMetadataKey.VERSION] = detectedMetadata[ClusterMetadataKey.VERSION];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.version).toEqual("some-version");
  });

  it("given cluster metadata has nodes count, updates entity metadata with node count", () => {
    cluster.metadata[ClusterMetadataKey.NODES_COUNT] = detectedMetadata[ClusterMetadataKey.NODES_COUNT];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.nodes).toEqual(42);
  });

  it("given cluster metadata has prometheus data, updates entity metadata with prometheus data", () => {
    cluster.metadata[ClusterMetadataKey.PROMETHEUS] = detectedMetadata[ClusterMetadataKey.PROMETHEUS];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.prometheus).toEqual({
      "some-parameter": "some-value",
    });
  });

  it("given cluster metadata has distribution, updates entity metadata with distribution", () => {
    cluster.metadata[ClusterMetadataKey.DISTRIBUTION] = detectedMetadata[ClusterMetadataKey.DISTRIBUTION];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.distribution).toEqual("some-distribution");
  });

  it("given cluster metadata has cluster id, updates entity metadata with cluster id", () => {
    cluster.metadata[ClusterMetadataKey.CLUSTER_ID] = detectedMetadata[ClusterMetadataKey.CLUSTER_ID];
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.id).toEqual("some-cluster-id");
  });

  it("given cluster metadata has no kubernetes version, updates entity metadata with 'unknown' kubernetes version", () => {
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.kubeVersion).toEqual("unknown");
  });

  it("given cluster metadata has kubernetes version, updates entity metadata with kubernetes version", () => {
    cluster.metadata.version = "some-kubernetes-version";
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.kubeVersion).toEqual("some-kubernetes-version");
  });

  it("given cluster has labels, updates entity metadata with labels", () => {
    replaceObservableObject(cluster.labels, {
      "some-label": "some-value",
    });
    entity.metadata.labels = {
      "some-other-label": "some-other-value",
    };
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.labels).toEqual({
      "some-label": "some-value",
      "some-other-label": "some-other-value",
    });
  });

  it("given cluster has labels, overwrites entity metadata with cluster labels", () => {
    replaceObservableObject(cluster.labels, {
      "some-label": "some-cluster-value",
    });
    entity.metadata.labels = {
      "some-label": "some-entity-value",
    };
    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.labels).toEqual({
      "some-label": "some-cluster-value",
    });
  });

  it("give cluster preferences has name, updates entity metadata with name", () => {
    cluster.preferences.clusterName = "some-cluster-name";

    updateEntityMetadata(entity, cluster);
    expect(entity.metadata.name).toEqual("some-cluster-name");
  });
});
