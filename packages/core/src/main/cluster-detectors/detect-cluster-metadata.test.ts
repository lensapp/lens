/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AppPaths } from "../../common/app-paths/app-path-injection-token";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { ClusterMetadataKey } from "../../common/cluster-types";
import { Cluster } from "../../common/cluster/cluster";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import clusterDistributionDetectorInjectable from "./cluster-distribution-detector.injectable";
import clusterIdDetectorFactoryInjectable from "./cluster-id-detector.injectable";
import clusterLastSeenDetectorInjectable from "./cluster-last-seen-detector.injectable";
import clusterNodeCountDetectorInjectable from "./cluster-nodes-count-detector.injectable";
import type { DetectClusterMetadata } from "./detect-cluster-metadata.injectable";
import detectClusterMetadataInjectable from "./detect-cluster-metadata.injectable";
import requestClusterVersionInjectable from "./request-cluster-version.injectable";

describe("detect-cluster-metadata", () => {
  let detectClusterMetadata: DetectClusterMetadata;

  let cluster: Cluster;

  beforeEach(async () => {
    const di = getDiForUnitTesting();

    const lastSeenDetectMock = jest.fn().mockReturnValue(Promise.resolve({ value: "some-time-stamp", accuracy: 100 }));
    const nodeCountDetectMock = jest.fn().mockReturnValue(Promise.resolve({ value: 42, accuracy: 100 }));
    const clusterIdDetectMock = jest.fn().mockReturnValue(Promise.resolve({ value: "some-cluster-id", accuracy: 100 }));
    const distributionDetectMock = jest.fn().mockReturnValue(Promise.resolve({ value: "some-distribution", accuracy: 100 }));

    di.override(clusterLastSeenDetectorInjectable, () => {
      return {
        key: ClusterMetadataKey.LAST_SEEN,
        detect: lastSeenDetectMock,
      };
    });

    di.override(requestClusterVersionInjectable, () => () => Promise.resolve("some-cluster-version"));

    di.override(clusterNodeCountDetectorInjectable, () => ({
      key: ClusterMetadataKey.NODES_COUNT,
      detect: nodeCountDetectMock,
    }));

    di.override(clusterIdDetectorFactoryInjectable, () => ({
      key: ClusterMetadataKey.CLUSTER_ID,
      detect: clusterIdDetectMock,
    }));

    di.override(clusterDistributionDetectorInjectable, () => ({
      key: ClusterMetadataKey.DISTRIBUTION,
      detect: distributionDetectMock,
    }));

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(appPathsStateInjectable, () => ({
      get: () => ({} as AppPaths),
      set: () => {},
    }));

    detectClusterMetadata = di.inject(detectClusterMetadataInjectable);

    cluster = new Cluster({
      id: "some-id",
      contextName: "some-context",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  it("given some cluster, last seen time stamp is added to the metadata", async () => {
    const metadata = await detectClusterMetadata(cluster);

    expect(metadata.lastSeen).toEqual("some-time-stamp");
  });

  it("given some cluster, cluster version is added to the metadata", async () => {
    const metadata = await detectClusterMetadata(cluster);

    expect(metadata.version).toEqual("some-cluster-version");
  });

  it("given some cluster, id is added to the metadata", async () => {
    const metadata = await detectClusterMetadata(cluster);

    expect(metadata.id).toEqual("some-cluster-id");
  });

  it("given some cluster, node count is added to the metadata", async () => {
    const metadata = await detectClusterMetadata(cluster);

    expect(metadata.nodes).toEqual(42);
  });

  it("given some cluster, distribution is added to the metadata", async () => {
    const metadata = await detectClusterMetadata(cluster);

    expect(metadata.distribution).toEqual("some-distribution");
  });
});
