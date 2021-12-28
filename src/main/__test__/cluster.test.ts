/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const logger = {
  silly: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  crit: jest.fn(),
};

jest.mock("winston", () => ({
  format: {
    colorize: jest.fn(),
    combine: jest.fn(),
    simple: jest.fn(),
    label: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  },
  createLogger: jest.fn().mockReturnValue(logger),
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

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

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("create clusters", () => {
  let cluster: Cluster;
  let createCluster: (model: ClusterModel) => Cluster;

  beforeEach(async () => {
    jest.clearAllMocks();

    const di = getDiForUnitTesting({ doGeneralOverrides: true });


    const mockOpts = {
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
    };

    mockFs(mockOpts);
    
    await di.runSetups();

    createCluster = di.inject(createClusterInjectionToken);
    
    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true));

    cluster = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  afterEach(() => {
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

    cluster.contextHandler = {
      ensureServer: jest.fn(),
      stopServer: jest.fn(),
    } as any;

    jest.spyOn(cluster, "reconnect");
    jest.spyOn(cluster, "canI");
    jest.spyOn(cluster, "refreshConnectionStatus");

    await cluster.activate();

    expect(cluster.reconnect).toBeCalled();
    expect(cluster.refreshConnectionStatus).toBeCalled();

    cluster.disconnect();
    jest.resetAllMocks();
  });
});
