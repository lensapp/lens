/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

jest.mock("../../common/ipc");
jest.mock("request");
jest.mock("request-promise-native");

import { Console } from "console";
import mockFs from "mock-fs";
import type { Cluster } from "../../common/cluster/cluster";
import { Kubectl } from "../kubectl/kubectl";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { ClusterModel } from "../../common/cluster-types";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import authorizationReviewInjectable from "../../common/cluster/authorization-review.injectable";
import listNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import { parse } from "url";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("create clusters", () => {
  let cluster: Cluster;
  let createCluster: (model: ClusterModel) => Cluster;

  beforeEach(async () => {
    jest.clearAllMocks();

    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs({
      "minikube-config.yml": JSON.stringify({
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
      }),
    });

    await di.runSetups();

    di.override(authorizationReviewInjectable, () => () => () => Promise.resolve(true));
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

    createCluster = di.inject(createClusterInjectionToken);

    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true));

    cluster = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  afterEach(() => {
    cluster.disconnect();
    mockFs.restore();
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
    const cluster = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });

    jest.spyOn(cluster, "reconnect");
    jest.spyOn(cluster, "refreshConnectionStatus");

    await cluster.activate();

    expect(cluster.reconnect).toBeCalled();
    expect(cluster.refreshConnectionStatus).toBeCalled();

    cluster.disconnect();
    jest.resetAllMocks();
  });
});
