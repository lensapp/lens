/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterStore } from "../../common/cluster-store/cluster-store";
import clusterStoreInjectable from "../../common/cluster-store/cluster-store.injectable";
import type { ClusterId } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import navigateToClusterViewInjectable from "../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import type { ReadFileSync } from "../../common/fs/read-file-sync.injectable";
import readFileSyncInjectable from "../../common/fs/read-file-sync.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import createClusterInjectable from "../../renderer/create-cluster/create-cluster.injectable";

describe("cluster connection status", () => {
  let clusterStore: ClusterStore;
  let clusters: Map<ClusterId, Cluster>;
  let cluster: Cluster;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    const readFileSyncMock: ReadFileSync = (filePath) => {
      expect(filePath).toBe("/some/file/path");

      return JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: "https://192.168.64.3:8443",
          },
        }],
        contexts: [{
          context: {
            cluster: "minikube",
            user: "minikube",
          },
          name: "minikube",
        }],
        users: [{
          name: "minikube",
        }],
        kind: "Config",
        preferences: {},
      });
    };

    applicationBuilder.dis.rendererDi.override(readFileSyncInjectable, () => readFileSyncMock);

    const navigateToClusterView = applicationBuilder.dis.rendererDi.inject(navigateToClusterViewInjectable);
    const createCluster = applicationBuilder.dis.rendererDi.inject(createClusterInjectable);

    cluster = createCluster({
      contextName: "minikube",
      id: "some-cluster-id",
      kubeConfigPath: "/some/file/path",
    }, {
      clusterServerUrl: "https://localhost:1234",
    });

    clusters = new Map();

    clusters.set(cluster.id, cluster);

    clusterStore = ({
      clusters,
      get clustersList() {
        return [...clusters.values()];
      },
      getById: (id) => clusters.get(id),
    }) as ClusterStore;

    applicationBuilder.dis.mainDi.override(clusterStoreInjectable, () => clusterStore);
    applicationBuilder.dis.rendererDi.override(clusterStoreInjectable, () => clusterStore);

    await applicationBuilder.render();

    navigateToClusterView(cluster.id);
  });
});
