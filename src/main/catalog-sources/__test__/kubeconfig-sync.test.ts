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

import { ObservableMap } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { loadFromOptions } from "../../../common/kube-helpers";
import type { Cluster } from "../../cluster";
import { computeDiff, configToModels } from "../kubeconfig-sync";
import mockFs from "mock-fs";
import fs from "fs";
import { ClusterStore } from "../../../common/cluster-store";
import { ClusterManager } from "../../cluster-manager";
import { AppPaths } from "../../../common/app-paths";

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

AppPaths.init();

describe("kubeconfig-sync.source tests", () => {
  beforeEach(() => {
    mockFs();
    ClusterStore.createInstance();
    ClusterManager.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
    ClusterStore.resetInstance();
    ClusterManager.resetInstance();
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
