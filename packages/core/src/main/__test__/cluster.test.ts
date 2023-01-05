/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import { Console } from "console";
import type { Cluster } from "../../common/cluster/cluster";
import { Kubectl } from "../kubectl/kubectl";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { CreateCluster } from "../../common/cluster/create-cluster-injection-token";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import authorizationReviewInjectable from "../../common/cluster/authorization-review.injectable";
import requestNamespaceListPermissionsForInjectable from "../../common/cluster/request-namespace-list-permissions.injectable";
import listNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import { parse } from "url";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../kubectl/normalized-arch.injectable";
import pathExistsSyncInjectable from "../../common/fs/path-exists-sync.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import readJsonSyncInjectable from "../../common/fs/read-json-sync.injectable";
import writeJsonSyncInjectable from "../../common/fs/write-json-sync.injectable";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("create clusters", () => {
  let cluster: Cluster;
  let createCluster: CreateCluster;

  beforeEach(() => {
    jest.clearAllMocks();

    const di = getDiForUnitTesting({ doGeneralOverrides: true });
    const clusterServerUrl = "https://192.168.64.3:8443";

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "some-directory-for-temp");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");
    di.override(broadcastMessageInjectable, () => async () => {});
    di.override(authorizationReviewInjectable, () => () => () => Promise.resolve(true));
    di.override(requestNamespaceListPermissionsForInjectable, () => () => async () => () => true);
    di.override(listNamespacesInjectable, () => () => () => Promise.resolve([ "default" ]));
    di.override(createContextHandlerInjectable, () => (cluster) => ({
      restartServer: jest.fn(),
      stopServer: jest.fn(),
      clusterUrl: parse(cluster.apiUrl),
      getApiTarget: jest.fn(),
      getPrometheusDetails: jest.fn(),
      resolveAuthProxyCa: jest.fn(),
      resolveAuthProxyUrl: jest.fn(),
      setupPrometheus: jest.fn(),
      ensureServer: jest.fn(),
    } as ClusterContextHandler));
    di.override(pathExistsInjectable, () => () => { throw new Error("tried call pathExists without override"); });
    di.override(pathExistsSyncInjectable, () => () => { throw new Error("tried call pathExistsSync without override"); });
    di.override(readJsonSyncInjectable, () => () => { throw new Error("tried call readJsonSync without override"); });
    di.override(writeJsonSyncInjectable, () => () => { throw new Error("tried call writeJsonSync without override"); });

    createCluster = di.inject(createClusterInjectionToken);

    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true));

    cluster = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    }, {
      clusterServerUrl,
    });
  });

  afterEach(() => {
    cluster.disconnect();
  });

  it("should be able to create a cluster from a cluster model and apiURL should be decoded", () => {
    expect(cluster.apiUrl).toBe("https://192.168.64.3:8443");
  });

  it("reconnect should not throw if contextHandler is missing", () => {
    expect(() => cluster.reconnect()).not.toThrowError();
  });

  it("disconnect should not throw if contextHandler is missing", () => {
    expect(() => cluster.disconnect()).not.toThrowError();
  });

  it("activating cluster should try to connect to cluster and do a refresh", async () => {
    jest.spyOn(cluster, "reconnect");
    jest.spyOn(cluster, "refreshConnectionStatus");

    await cluster.activate();

    expect(cluster.reconnect).toBeCalled();
    expect(cluster.refreshConnectionStatus).toBeCalled();

    cluster.disconnect();
    jest.resetAllMocks();
  });
});
