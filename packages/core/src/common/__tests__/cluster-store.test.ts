/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterStore } from "../cluster-store/cluster-store";
import type { GetCustomKubeConfigFilePath } from "../app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import getCustomKubeConfigFilePathInjectable from "../app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import clusterStoreInjectable from "../cluster-store/cluster-store.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import type { CreateCluster } from "../cluster/create-cluster-injection-token";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import assert from "assert";
import directoryForTempInjectable from "../app-paths/directory-for-temp/directory-for-temp.injectable";
import kubectlBinaryNameInjectable from "../../main/kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../../main/kubectl/normalized-arch.injectable";
import normalizedPlatformInjectable from "../vars/normalized-platform.injectable";
import type { WriteJsonSync } from "../fs/write-json-sync.injectable";
import writeJsonSyncInjectable from "../fs/write-json-sync.injectable";
import type { ReadFileSync } from "../fs/read-file-sync.injectable";
import readFileSyncInjectable from "../fs/read-file-sync.injectable";
import { readFileSync } from "fs";
import type { WriteFileSync } from "../fs/write-file-sync.injectable";
import writeFileSyncInjectable from "../fs/write-file-sync.injectable";
import type { WriteBufferSync } from "../fs/write-buffer-sync.injectable";
import writeBufferSyncInjectable from "../fs/write-buffer-sync.injectable";
import clusterStoreMigrationVersionInjectable from "../cluster-store/migration-version.injectable";

// NOTE: this is intended to read the actual file system
const testDataIcon = readFileSync("test-data/cluster-store-migration-icon.png");
const clusterServerUrl = "https://localhost";
const kubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${clusterServerUrl}
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

describe("cluster-store", () => {
  let di: DiContainer;
  let clusterStore: ClusterStore;
  let createCluster: CreateCluster;
  let writeJsonSync: WriteJsonSync;
  let writeFileSync: WriteFileSync;
  let writeBufferSync: WriteBufferSync;
  let readFileSync: ReadFileSync;
  let getCustomKubeConfigFilePath: GetCustomKubeConfigFilePath;
  let writeFileSyncAndReturnPath: (filePath: string, contents: string) => string;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "/some-temp-directory");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");
    createCluster = di.inject(createClusterInjectionToken);
    getCustomKubeConfigFilePath = di.inject(getCustomKubeConfigFilePathInjectable);
    writeJsonSync = di.inject(writeJsonSyncInjectable);
    writeFileSync = di.inject(writeFileSyncInjectable);
    writeBufferSync = di.inject(writeBufferSyncInjectable);
    readFileSync = di.inject(readFileSyncInjectable);
    writeFileSyncAndReturnPath = (filePath, contents) => (writeFileSync(filePath, contents), filePath);
  });

  describe("empty config", () => {
    beforeEach(async () => {
      writeJsonSync("/some-directory-for-user-data/lens-cluster-store.json", {});
      clusterStore = di.inject(clusterStoreInjectable);
      clusterStore.load();
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
          kubeConfigPath: writeFileSyncAndReturnPath(
            getCustomKubeConfigFilePath("foo"),
            kubeconfig,
          ),
        }, {
          clusterServerUrl,
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
          kubeConfigPath: writeFileSyncAndReturnPath(
            getCustomKubeConfigFilePath("prod"),
            kubeconfig,
          ),
        });
        store.addCluster({
          id: "dev",
          contextName: "foo2",
          preferences: {
            clusterName: "dev",
          },
          kubeConfigPath: writeFileSyncAndReturnPath(
            getCustomKubeConfigFilePath("dev"),
            kubeconfig,
          ),
        });
      });

      it("check if store can contain multiple clusters", () => {
        expect(clusterStore.hasClusters()).toBeTruthy();
        expect(clusterStore.clusters.size).toBe(2);
      });

      it("check if cluster's kubeconfig file saved", () => {
        const file = writeFileSyncAndReturnPath(getCustomKubeConfigFilePath("boo"), "kubeconfig");

        expect(readFileSync(file)).toBe("kubeconfig");
      });
    });
  });

  describe("config with existing clusters", () => {
    beforeEach(() => {
      writeFileSync("/temp-kube-config", kubeconfig);
      writeJsonSync("/some-directory-for-user-data/lens-cluster-store.json", {
        __internal__: {
          migrations: {
            version: "99.99.99",
          },
        },
        clusters: [
          {
            id: "cluster1",
            kubeConfigPath: "/temp-kube-config",
            contextName: "foo",
            preferences: { terminalCWD: "/foo" },
            workspace: "default",
          },
          {
            id: "cluster2",
            kubeConfigPath: "/temp-kube-config",
            contextName: "foo2",
            preferences: { terminalCWD: "/foo2" },
          },
          {
            id: "cluster3",
            kubeConfigPath: "/temp-kube-config",
            contextName: "foo",
            preferences: { terminalCWD: "/foo" },
            workspace: "foo",
            ownerRef: "foo",
          },
        ],
      });
      clusterStore = di.inject(clusterStoreInjectable);
      clusterStore.load();
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
      writeFileSync("/invalid-kube-config", invalidKubeconfig);
      writeFileSync("/valid-kube-config", kubeconfig);
      writeJsonSync("/some-directory-for-user-data/lens-cluster-store.json", {
        __internal__: {
          migrations: {
            version: "99.99.99",
          },
        },
        clusters: [
          {
            id: "cluster1",
            kubeConfigPath: "/invalid-kube-config",
            contextName: "test",
            preferences: { terminalCWD: "/foo" },
            workspace: "foo",
          },
          {
            id: "cluster2",
            kubeConfigPath: "/valid-kube-config",
            contextName: "foo",
            preferences: { terminalCWD: "/foo" },
            workspace: "default",
          },
        ],
      });
      clusterStore = di.inject(clusterStoreInjectable);
      clusterStore.load();
    });

    it("does not enable clusters with invalid kubeconfig", () => {
      const storedClusters = clusterStore.clustersList;

      expect(storedClusters.length).toBe(1);
    });
  });

  describe("pre 3.6.0-beta.1 config with an existing cluster", () => {
    beforeEach(() => {
      writeJsonSync("/some-directory-for-user-data/lens-cluster-store.json", {
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
      });
      writeBufferSync("/some-directory-for-user-data/icon_path", testDataIcon);

      di.override(clusterStoreMigrationVersionInjectable, () => "3.6.0");

      clusterStore = di.inject(clusterStoreInjectable);
      clusterStore.load();
    });

    it("migrates to modern format with kubeconfig in a file", async () => {
      const config = clusterStore.clustersList[0].kubeConfigPath;

      expect(readFileSync(config)).toBe(minimalValidKubeConfig);
    });

    it("migrates to modern format with icon not in file", async () => {
      expect(clusterStore.clustersList[0].preferences.icon).toMatch(/data:;base64,/);
    });
  });
});

const invalidKubeconfig = JSON.stringify({
  apiVersion: "v1",
  clusters: [{
    cluster: {
      server: "https://localhost",
    },
    name: "test2",
  }],
  contexts: [{
    context: {
      cluster: "test",
      user: "test",
    },
    name: "test",
  }],
  "current-context": "test",
  kind: "Config",
  preferences: {},
  users: [{
    user: {
      token: "kubeconfig-user-q4lm4:xxxyyyy",
    },
    name: "test",
  }],
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
