/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, ObservableMap, when } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { loadFromOptions } from "../../../common/kube-helpers";
import type { Cluster } from "../../../common/cluster/cluster";
import mockFs from "mock-fs";
import fs from "fs";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForTempInjectable from "../../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import kubectlBinaryNameInjectable from "../../kubectl/binary-name.injectable";
import kubectlDownloadingNormalizedArchInjectable from "../../kubectl/normalized-arch.injectable";
import normalizedPlatformInjectable from "../../../common/vars/normalized-platform.injectable";
import { iter } from "../../../common/utils";
import fsInjectable from "../../../common/fs/fs.injectable";
import type { ComputeKubeconfigDiff } from "../kubeconfig-sync/compute-diff.injectable";
import computeKubeconfigDiffInjectable from "../kubeconfig-sync/compute-diff.injectable";
import watchInjectable from "../../../common/fs/watch.injectable";
import type { ConfigToModels } from "../kubeconfig-sync/config-to-models.injectable";
import configToModelsInjectable from "../kubeconfig-sync/config-to-models.injectable";
import kubeconfigSyncManagerInjectable from "../kubeconfig-sync/manager.injectable";
import type { KubeconfigSyncManager } from "../kubeconfig-sync/manager";
import type { KubeconfigSyncValue } from "../../../common/user-store";
import kubeconfigSyncsInjectable from "../../../common/user-store/kubeconfig-syncs.injectable";

console.log("This is a reminder that mockFS breaks things and needs to be removed");

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

describe("kubeconfig-sync.source tests", () => {
  let computeKubeconfigDiff: ComputeKubeconfigDiff;
  let configToModels: ConfigToModels;
  let manager: KubeconfigSyncManager;
  let kubeconfigSyncs: ObservableMap<string, KubeconfigSyncValue>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForTempInjectable, () => "some-directory-for-temp");
    di.override(kubectlBinaryNameInjectable, () => "kubectl");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");
    di.override(normalizedPlatformInjectable, () => "darwin");

    di.permitSideEffects(fsInjectable);
    di.permitSideEffects(watchInjectable);
    di.unoverride(clusterStoreInjectable);
    di.permitSideEffects(clusterStoreInjectable);
    di.permitSideEffects(getConfigurationFileModelInjectable);

    kubeconfigSyncs = observable.map();

    di.override(kubeconfigSyncsInjectable, () => kubeconfigSyncs);

    computeKubeconfigDiff = di.inject(computeKubeconfigDiffInjectable);
    configToModels = di.inject(configToModelsInjectable);
    manager = di.inject(kubeconfigSyncManagerInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("configsToModels", () => {
    it("should filter out invalid split configs", () => {
      const config = loadFromOptions({
        clusters: [],
        users: [],
        contexts: [],
        currentContext: "foobar",
      });

      expect(configToModels(config, "").length).toBe(0);
    });

    it("should keep a single valid split config", () => {
      const config = loadFromOptions({
        clusters: [{
          name: "cluster-name",
          server: "1.2.3.4",
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",
        }],
        contexts: [{
          cluster: "cluster-name",
          name: "context-name",
          user: "user-name",
        }],
        currentContext: "foobar",
      });

      const models = configToModels(config, "/bar");

      expect(models.length).toBe(1);
      expect(models[0][0].contextName).toBe("context-name");
      expect(models[0][0].kubeConfigPath).toBe("/bar");
    });
  });

  describe("computeKubeconfigDiff", () => {
    it("should leave an empty source empty if there are no entries", () => {
      const contents = "";
      const rootSource = new ObservableMap<string, [Cluster, CatalogEntity]>();
      const filePath = "/bar";

      computeKubeconfigDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(0);
    });

    it("should add only the valid clusters to the source", () => {
      const contents = JSON.stringify({
        clusters: [{
          name: "cluster-name",
          cluster: {
            server: "1.2.3.4",
          },
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",
        }],
        contexts: [{
          name: "context-name",
          context: {
            cluster: "cluster-name",
            user: "user-name",
          },
        }, {
          name: "context-the-second",
          context: {
            cluster: "missing-cluster",
            user: "user-name",
          },
        }],
        currentContext: "foobar",
      });
      const rootSource = new ObservableMap<string, [Cluster, CatalogEntity]>();
      const filePath = "/bar";

      fs.writeFileSync(filePath, contents);

      computeKubeconfigDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const c = (iter.first(rootSource.values())!)[0];

      expect(c.kubeConfigPath).toBe("/bar");
      expect(c.contextName).toBe("context-name");
    });

    it("should remove a cluster when it is removed from the contents", () => {
      const contents = JSON.stringify({
        clusters: [{
          name: "cluster-name",
          cluster: {
            server: "1.2.3.4",
          },
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",

        }],
        contexts: [{
          name: "context-name",
          context: {
            cluster: "cluster-name",
            user: "user-name",
          },
        }, {
          name: "context-the-second",
          context: {
            cluster: "missing-cluster",
            user: "user-name",
          },
        }],
        currentContext: "foobar",
      });
      const rootSource = new ObservableMap<string, [Cluster, CatalogEntity]>();
      const filePath = "/bar";

      fs.writeFileSync(filePath, contents);

      computeKubeconfigDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      const c = rootSource.values().next().value[0] as Cluster;

      expect(c.kubeConfigPath).toBe("/bar");
      expect(c.contextName).toBe("context-name");

      computeKubeconfigDiff("{}", rootSource, filePath);

      expect(rootSource.size).toBe(0);
    });

    it("should remove only the cluster that it is removed from the contents", () => {
      const contents = JSON.stringify({
        clusters: [{
          name: "cluster-name",
          cluster: {
            server: "1.2.3.4",
          },
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",
        }, {
          name: "user-name-2",
        }],
        contexts: [{
          name: "context-name",
          context: {
            cluster: "cluster-name",
            user: "user-name",
          },
        }, {
          name: "context-name-2",
          context: {
            cluster: "cluster-name",
            user: "user-name-2",
          },
        }, {
          name: "context-the-second",
          context: {
            cluster: "missing-cluster",
            user: "user-name",
          },
        }],
        currentContext: "foobar",
      });
      const rootSource = new ObservableMap<string, [Cluster, CatalogEntity]>();
      const filePath = "/bar";

      fs.writeFileSync(filePath, contents);

      computeKubeconfigDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(2);

      {
        const c = rootSource.values().next().value[0] as Cluster;

        expect(c.kubeConfigPath).toBe("/bar");
        expect(["context-name", "context-name-2"].includes(c.contextName)).toBe(true);
      }

      const newContents = JSON.stringify({
        clusters: [{
          name: "cluster-name",
          cluster: {
            server: "1.2.3.4",
          },
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",
        }, {
          name: "user-name-2",
        }],
        contexts: [{
          name: "context-name",
          context: {
            cluster: "cluster-name",
            user: "user-name",
          },
        }, {
          name: "context-the-second",
          context: {
            cluster: "missing-cluster",
            user: "user-name",
          },
        }],
        currentContext: "foobar",
      });

      computeKubeconfigDiff(newContents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      {
        const c = rootSource.values().next().value[0] as Cluster;

        expect(c.kubeConfigPath).toBe("/bar");
        expect(c.contextName).toBe("context-name");
      }
    });
  });

  describe("given a config file at /foobar/config", () => {
    beforeEach(() => {
      fs.mkdirSync("/foobar");
      fs.writeFileSync("/foobar/config", JSON.stringify({
        clusters: [{
          name: "cluster-name",
          cluster: {
            server: "1.2.3.4",
          },
          skipTLSVerify: false,
        }],
        users: [{
          name: "user-name",
        }],
        contexts: [{
          name: "context-name",
          context: {
            cluster: "cluster-name",
            user: "user-name",
          },
        }, {
          name: "context-the-second",
          context: {
            cluster: "missing-cluster",
            user: "user-name",
          },
        }],
        currentContext: "foobar",
      }));
    });

    it("should not find any entities", () => {
      expect(manager.source.get()).toEqual([]);
    });

    describe("when sync has started", () => {
      beforeEach(() => {
        manager.startSync();
      });

      it("should not find any entities", () => {
        expect(manager.source.get()).toEqual([]);
      });

      describe("when a file sync target for /foobar/config is added", () => {
        beforeEach(() => {
          kubeconfigSyncs.set("/foobar/config", {});
        });

        it("should find a single entity", (done) => {
          when(() => manager.source.get().length === 1, () => done());
        });

        describe("when a folder sync target for /foobar is added", () => {
          beforeEach(() => {
            kubeconfigSyncs.set("/foobar", {});
          });

          it("should still only find a single entity", (done) => {
            when(() => manager.source.get().length === 1, () => done());
          });
        });
      });

      describe("when a folder sync target for /foobar is added", () => {
        beforeEach(() => {
          kubeconfigSyncs.set("/foobar", {});
        });

        it("should find a single entity", (done) => {
          when(() => manager.source.get().length === 1, () => done());
        });
      });
    });
  });
});
