/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ObservableMap } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { loadFromOptions } from "../../../common/kube-helpers";
import type { Cluster } from "../../../common/cluster/cluster";
import { computeDiff as computeDiffFor, configToModels } from "../kubeconfig-sync/manager";
import mockFs from "mock-fs";
import fs from "fs";
import { ClusterManager } from "../../cluster-manager";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { createClusterInjectionToken } from "../../../common/cluster/create-cluster-injection-token";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import getConfigurationFileModelInjectable
  from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable
  from "../../../common/get-configuration-file-model/app-version/app-version.injectable";

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
  let computeDiff: ReturnType<typeof computeDiffFor>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    await di.runSetups();

    computeDiff = computeDiffFor({
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createCluster: di.inject(createClusterInjectionToken),
    });

    di.override(clusterStoreInjectable, () =>
      ClusterStore.createInstance({ createCluster: () => null as never }),
    );

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);

    di.inject(clusterStoreInjectable);

    ClusterManager.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
    ClusterManager.resetInstance();
    ClusterStore.resetInstance();
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
      expect(models[0].contextName).toBe("context-name");
      expect(models[0].kubeConfigPath).toBe("/bar");
    });
  });

  describe("computeDiff", () => {
    it("should leave an empty source empty if there are no entries", () => {
      const contents = "";
      const rootSource = new ObservableMap<string, [Cluster, CatalogEntity]>();
      const filePath = "/bar";

      computeDiff(contents, rootSource, filePath);

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

      computeDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      const c = rootSource.values().next().value[0] as Cluster;

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

      computeDiff(contents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      const c = rootSource.values().next().value[0] as Cluster;

      expect(c.kubeConfigPath).toBe("/bar");
      expect(c.contextName).toBe("context-name");

      computeDiff("{}", rootSource, filePath);

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

      computeDiff(contents, rootSource, filePath);

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

      computeDiff(newContents, rootSource, filePath);

      expect(rootSource.size).toBe(1);

      {
        const c = rootSource.values().next().value[0] as Cluster;

        expect(c.kubeConfigPath).toBe("/bar");
        expect(c.contextName).toBe("context-name");
      }
    });
  });
});
