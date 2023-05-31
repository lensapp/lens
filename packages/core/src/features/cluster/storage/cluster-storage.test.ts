/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetCustomKubeConfigFilePath } from "../../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import getCustomKubeConfigFilePathInjectable from "../../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import assert from "assert";
import directoryForTempInjectable from "../../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import kubectlBinaryNameInjectable from "../../../main/kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../../../main/kubectl/normalized-arch.injectable";
import normalizedPlatformInjectable from "../../../common/vars/normalized-platform.injectable";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";
import type { WriteJsonSync } from "../../../common/fs/write-json-sync.injectable";
import writeJsonSyncInjectable from "../../../common/fs/write-json-sync.injectable";
import type { ReadFileSync } from "../../../common/fs/read-file-sync.injectable";
import readFileSyncInjectable from "../../../common/fs/read-file-sync.injectable";
import { readFileSync } from "fs";
import type { WriteFileSync } from "../../../common/fs/write-file-sync.injectable";
import writeFileSyncInjectable from "../../../common/fs/write-file-sync.injectable";
import type { WriteBufferSync } from "../../../common/fs/write-buffer-sync.injectable";
import writeBufferSyncInjectable from "../../../common/fs/write-buffer-sync.injectable";
import clustersPersistentStorageInjectable from "./common/storage.injectable";
import type { PersistentStorage } from "../../persistent-storage/common/create.injectable";
import type { AddCluster } from "./common/add.injectable";
import addClusterInjectable from "./common/add.injectable";
import type { GetClusterById } from "./common/get-by-id.injectable";
import getClusterByIdInjectable from "./common/get-by-id.injectable";
import type { IComputedValue } from "mobx";
import clustersInjectable from "./common/clusters.injectable";
import type { Cluster } from "../../../common/cluster/cluster";

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

describe("cluster storage technical tests", () => {
  let di: DiContainer;
  let clustersPersistentStorage: PersistentStorage;
  let writeJsonSync: WriteJsonSync;
  let writeFileSync: WriteFileSync;
  let writeBufferSync: WriteBufferSync;
  let readFileSync: ReadFileSync;
  let getCustomKubeConfigFilePath: GetCustomKubeConfigFilePath;
  let writeFileSyncAndReturnPath: (filePath: string, contents: string) => string;
  let addCluster: AddCluster;
  let getClusterById: GetClusterById;
  let clusters: IComputedValue<Cluster[]>;

  beforeEach(async () => {
    di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "/some-temp-directory");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");
    writeJsonSync = di.inject(writeJsonSyncInjectable);
    writeFileSync = di.inject(writeFileSyncInjectable);
    writeBufferSync = di.inject(writeBufferSyncInjectable);
    readFileSync = di.inject(readFileSyncInjectable);
    addCluster = di.inject(addClusterInjectable);
    getClusterById = di.inject(getClusterByIdInjectable);
    clusters = di.inject(clustersInjectable);
    writeFileSyncAndReturnPath = (filePath, contents) => (writeFileSync(filePath, contents), filePath);
  });

  describe("empty config", () => {
    beforeEach(async () => {
      getCustomKubeConfigFilePath = di.inject(getCustomKubeConfigFilePathInjectable);

      writeJsonSync("/some-directory-for-user-data/lens-cluster-store.json", {});
      clustersPersistentStorage = di.inject(clustersPersistentStorageInjectable);
      clustersPersistentStorage.loadAndStartSyncing();
    });

    describe("with foo cluster added", () => {
      beforeEach(() => {
        addCluster({
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
        });
      });

      it("adds new cluster to store", async () => {
        const storedCluster = getClusterById("foo");

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
        addCluster({
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
        addCluster({
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
        expect(clusters.get().length).toBe(2);
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

      getCustomKubeConfigFilePath = di.inject(getCustomKubeConfigFilePathInjectable);

      clustersPersistentStorage = di.inject(clustersPersistentStorageInjectable);
      clustersPersistentStorage.loadAndStartSyncing();
    });
    it("allows to retrieve a cluster", () => {
      const storedCluster = getClusterById("cluster1");

      assert(storedCluster);

      expect(storedCluster.id).toBe("cluster1");
      expect(storedCluster.preferences.terminalCWD).toBe("/foo");
    });

    it("allows getting all of the clusters", async () => {
      const storedClusters = clusters.get();

      expect(storedClusters.length).toBe(3);
      expect(storedClusters[0].id).toBe("cluster1");
      expect(storedClusters[0].preferences.terminalCWD).toBe("/foo");
      expect(storedClusters[1].id).toBe("cluster2");
      expect(storedClusters[1].preferences.terminalCWD).toBe("/foo2");
      expect(storedClusters[2].id).toBe("cluster3");
    });
  });

  describe("pre 3.6.0-beta.1 config with an existing cluster", () => {
    beforeEach(() => {
      di.override(storeMigrationVersionInjectable, () => "3.6.0");

      getCustomKubeConfigFilePath = di.inject(getCustomKubeConfigFilePathInjectable);

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


      clustersPersistentStorage = di.inject(clustersPersistentStorageInjectable);
      clustersPersistentStorage.loadAndStartSyncing();
    });

    it("migrates to modern format with kubeconfig in a file", async () => {
      const configPath = clusters.get()[0].kubeConfigPath.get();

      expect(readFileSync(configPath)).toBe(minimalValidKubeConfig);
    });

    it("migrates to modern format with icon not in file", async () => {
      expect(clusters.get()[0].preferences.icon).toMatch(/data:;base64,/);
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
