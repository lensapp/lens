/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs";
import mockFs from "mock-fs";
import path from "path";
import fse from "fs-extra";
import type { Cluster } from "../cluster/cluster";
import { ClusterStore } from "../cluster-store/cluster-store";
import { Console } from "console";
import { stdout, stderr } from "process";
import getCustomKubeConfigDirectoryInjectable from "../app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import clusterStoreInjectable from "../cluster-store/cluster-store.injectable";
import type { ClusterModel } from "../cluster-types";
import type { DiContainer } from "@ogre-tools/injectable";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import assert from "assert";

console = new Console(stdout, stderr);

const testDataIcon = fs.readFileSync(
  "test-data/cluster-store-migration-icon.png",
);
const kubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost
  name: test
contexts:
- context:
    cluster: test
    user: test
  name: foo
- context:
    cluster: test
    user: test
  name: foo2
current-context: test
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

const embed = (directoryName: string, contents: any): string => {
  fse.ensureDirSync(path.dirname(directoryName));
  fse.writeFileSync(directoryName, contents, {
    encoding: "utf-8",
    mode: 0o600,
  });

  return directoryName;
};

jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
}));

describe("cluster-store", () => {
  let mainDi: DiContainer;
  let clusterStore: ClusterStore;
  let createCluster: (model: ClusterModel) => Cluster;

  beforeEach(async () => {
    mainDi = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    mainDi.override(clusterStoreInjectable, (di) => ClusterStore.createInstance({ createCluster: di.inject(createClusterInjectionToken) }));
    mainDi.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    mainDi.permitSideEffects(getConfigurationFileModelInjectable);
    mainDi.permitSideEffects(appVersionInjectable);

    await mainDi.runSetups();

    createCluster = mainDi.inject(createClusterInjectionToken);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("empty config", () => {
    let getCustomKubeConfigDirectory: (directoryName: string) => string;

    beforeEach(async () => {
      getCustomKubeConfigDirectory = mainDi.inject(
        getCustomKubeConfigDirectoryInjectable,
      );

      // TODO: Remove these by removing Singleton base-class from BaseStore
      ClusterStore.getInstance(false)?.unregisterIpcListener();
      ClusterStore.resetInstance();

      const mockOpts = {
        "some-directory-for-user-data": {
          "lens-cluster-store.json": JSON.stringify({}),
        },
      };

      mockFs(mockOpts);

      clusterStore = mainDi.inject(clusterStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    describe("with foo cluster added", () => {
      beforeEach(() => {
        const cluster = createCluster({
          id: "foo",
          contextName: "foo",
          preferences: {
            terminalCWD: "/some-directory-for-user-data",
            icon: "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5",
            clusterName: "minikube",
          },
          kubeConfigPath: embed(
            getCustomKubeConfigDirectory("foo"),
            kubeconfig,
          ),
        });

        clusterStore.addCluster(cluster);
      });

      it("adds new cluster to store", async () => {
        const storedCluster = clusterStore.getById("foo");

        assert(storedCluster);

        expect(storedCluster.id).toBe("foo");
        expect(storedCluster.preferences.terminalCWD).toBe("/some-directory-for-user-data");
        expect(storedCluster.preferences.icon).toBe(
          "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5",
        );
      });
    });

    describe("with prod and dev clusters added", () => {
      beforeEach(() => {
        const store = clusterStore;

        store.addCluster({
          id: "prod",
          contextName: "foo",
          preferences: {
            clusterName: "prod",
          },
          kubeConfigPath: embed(
            getCustomKubeConfigDirectory("prod"),
            kubeconfig,
          ),
        });
        store.addCluster({
          id: "dev",
          contextName: "foo2",
          preferences: {
            clusterName: "dev",
          },
          kubeConfigPath: embed(
            getCustomKubeConfigDirectory("dev"),
            kubeconfig,
          ),
        });
      });

      it("check if store can contain multiple clusters", () => {
        expect(clusterStore.hasClusters()).toBeTruthy();
        expect(clusterStore.clusters.size).toBe(2);
      });

      it("check if cluster's kubeconfig file saved", () => {
        const file = embed(getCustomKubeConfigDirectory("boo"), "kubeconfig");

        expect(fs.readFileSync(file, "utf8")).toBe("kubeconfig");
      });
    });
  });

  describe("config with existing clusters", () => {
    beforeEach(() => {
      ClusterStore.resetInstance();

      const mockOpts = {
        "temp-kube-config": kubeconfig,
        "some-directory-for-user-data": {
          "lens-cluster-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "99.99.99",
              },
            },
            clusters: [
              {
                id: "cluster1",
                kubeConfigPath: "./temp-kube-config",
                contextName: "foo",
                preferences: { terminalCWD: "/foo" },
                workspace: "default",
              },
              {
                id: "cluster2",
                kubeConfigPath: "./temp-kube-config",
                contextName: "foo2",
                preferences: { terminalCWD: "/foo2" },
              },
              {
                id: "cluster3",
                kubeConfigPath: "./temp-kube-config",
                contextName: "foo",
                preferences: { terminalCWD: "/foo" },
                workspace: "foo",
                ownerRef: "foo",
              },
            ],
          }),
        },
      };

      mockFs(mockOpts);

      clusterStore = mainDi.inject(clusterStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows to retrieve a cluster", () => {
      const storedCluster = clusterStore.getById("cluster1");

      assert(storedCluster);

      expect(storedCluster.id).toBe("cluster1");
      expect(storedCluster.preferences.terminalCWD).toBe("/foo");
    });

    it("allows getting all of the clusters", async () => {
      const storedClusters = clusterStore.clustersList;

      expect(storedClusters.length).toBe(3);
      expect(storedClusters[0].id).toBe("cluster1");
      expect(storedClusters[0].preferences.terminalCWD).toBe("/foo");
      expect(storedClusters[1].id).toBe("cluster2");
      expect(storedClusters[1].preferences.terminalCWD).toBe("/foo2");
      expect(storedClusters[2].id).toBe("cluster3");
    });
  });

  describe("config with invalid cluster kubeconfig", () => {
    beforeEach(() => {
      const invalidKubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost
  name: test2
contexts:
- context:
    cluster: test
    user: test
  name: test
current-context: test
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

      ClusterStore.resetInstance();

      const mockOpts = {
        "invalid-kube-config": invalidKubeconfig,
        "valid-kube-config": kubeconfig,
        "some-directory-for-user-data": {
          "lens-cluster-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "99.99.99",
              },
            },
            clusters: [
              {
                id: "cluster1",
                kubeConfigPath: "./invalid-kube-config",
                contextName: "test",
                preferences: { terminalCWD: "/foo" },
                workspace: "foo",
              },
              {
                id: "cluster2",
                kubeConfigPath: "./valid-kube-config",
                contextName: "foo",
                preferences: { terminalCWD: "/foo" },
                workspace: "default",
              },
            ],
          }),
        },
      };

      mockFs(mockOpts);

      clusterStore = mainDi.inject(clusterStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("does not enable clusters with invalid kubeconfig", () => {
      const storedClusters = clusterStore.clustersList;

      expect(storedClusters.length).toBe(1);
    });
  });

  describe("pre 3.6.0-beta.1 config with an existing cluster", () => {
    beforeEach(() => {
      ClusterStore.resetInstance();
      const mockOpts = {
        "some-directory-for-user-data": {
          "lens-cluster-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "3.5.0",
              },
            },
            clusters: [
              {
                id: "cluster1",
                kubeConfig: minimalValidKubeConfig,
                contextName: "cluster",
                preferences: {
                  icon: "store://icon_path",
                },
              },
            ],
          }),
          icon_path: testDataIcon,
        },
      };

      mockFs(mockOpts);

      clusterStore = mainDi.inject(clusterStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("migrates to modern format with kubeconfig in a file", async () => {
      const config = clusterStore.clustersList[0].kubeConfigPath;

      expect(fs.readFileSync(config, "utf8")).toBe(minimalValidKubeConfig);
    });

    it("migrates to modern format with icon not in file", async () => {
      const { icon } = clusterStore.clustersList[0].preferences;

      assert(icon);
      expect(icon.startsWith("data:;base64,")).toBe(true);
    });
  });
});

const minimalValidKubeConfig = JSON.stringify({
  apiVersion: "v1",
  clusters: [
    {
      name: "minikube",
      cluster: {
        server: "https://192.168.64.3:8443",
      },
    },
  ],
  "current-context": "minikube",
  contexts: [
    {
      context: {
        cluster: "minikube",
        user: "minikube",
      },
      name: "minikube",
    },
  ],
  users: [
    {
      name: "minikube",
      user: {
        "client-certificate": "/Users/foo/.minikube/client.crt",
        "client-key": "/Users/foo/.minikube/client.key",
      },
    },
  ],
  kind: "Config",
  preferences: {},
});
