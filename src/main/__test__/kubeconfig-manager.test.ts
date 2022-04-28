/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
    padLevels: jest.fn(),
    ms: jest.fn(),
    printf: jest.fn(),
    splat: jest.fn(),
  },
  createLogger: jest.fn().mockReturnValue(logger),
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { KubeconfigManager } from "../kubeconfig-manager/kubeconfig-manager";
import mockFs from "mock-fs";
import type { Cluster } from "../../common/cluster/cluster";
import fse from "fs-extra";
import { loadYaml } from "@kubernetes/client-node";
import { Console } from "console";
import * as path from "path";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import type { ContextHandler } from "../context-handler/context-handler";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("kubeconfig manager tests", () => {
  let clusterFake: Cluster;
  let createKubeconfigManager: (cluster: Cluster) => KubeconfigManager;
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForTempInjectable, () => "some-directory-for-temp");

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

    di.override(createContextHandlerInjectable, () => () => ({
      ensureServer: async () => {},
      stopServer: jest.fn(),
    }) as unknown as ContextHandler);
    di.inject(lensProxyPortInjectable).set(9191);
    const createCluster = di.inject(createClusterInjectionToken);

    createKubeconfigManager = di.inject(createKubeconfigManagerInjectable);

    clusterFake = createCluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should create 'temp' kube config with proxy", async () => {
    const kubeConfManager = createKubeconfigManager(clusterFake);

    expect(logger.error).not.toBeCalled();
    expect(await kubeConfManager.getPath()).toBe(`some-directory-for-temp${path.sep}kubeconfig-foo`);
    // this causes an intermittent "ENXIO: no such device or address, read" error
    //    const file = await fse.readFile(await kubeConfManager.getPath());
    const file = fse.readFileSync(await kubeConfManager.getPath());
    const yml = loadYaml<any>(file.toString());

    expect(yml["current-context"]).toBe("minikube");
    expect(yml["clusters"][0]["cluster"]["server"].endsWith("/foo")).toBe(true);
    expect(yml["users"][0]["name"]).toBe("proxy");
  });

  it("should remove 'temp' kube config on unlink and remove reference from inside class", async () => {
    const kubeConfManager = createKubeconfigManager(clusterFake);

    const configPath = await kubeConfManager.getPath();

    expect(await fse.pathExists(configPath)).toBe(true);
    await kubeConfManager.clear();
    expect(await fse.pathExists(configPath)).toBe(false);
    await kubeConfManager.clear(); // doesn't throw
    expect(async () => {
      await kubeConfManager.getPath();
    }).rejects.toThrow("already unlinked");
  });
});
