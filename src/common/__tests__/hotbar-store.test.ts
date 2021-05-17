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

import mockFs from "mock-fs";
import { CatalogEntityItem } from "../../renderer/components/+catalog/catalog-entity.store";
import { ClusterStore } from "../cluster-store";
import { HotbarStore } from "../hotbar-store";

jest.mock("../../renderer/api/catalog-entity-registry", () => ({
  catalogEntityRegistry: {
    items: [
      {
        metadata: {
          uid: "1dfa26e2ebab15780a3547e9c7fa785c",
          name: "mycluster",
          source: "local"
        }
      },
      {
        metadata: {
          uid: "55b42c3c7ba3b04193416cda405269a5",
          name: "my_shiny_cluster",
          source: "remote"
        }
      }
    ]
  }
}));

const testCluster = {
  uid: "test",
  name: "test",
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running"
  },
  spec: {},
  getName: jest.fn(),
  getId: jest.fn(),
  onDetailsOpen: jest.fn(),
  onContextMenuOpen: jest.fn(),
  onSettingsOpen: jest.fn(),
  metadata: {
    uid: "test",
    name: "test",
    labels: {}
  }
};

const minikubeCluster = {
  uid: "minikube",
  name: "minikube",
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running"
  },
  spec: {},
  getName: jest.fn(),
  getId: jest.fn(),
  onDetailsOpen: jest.fn(),
  onContextMenuOpen: jest.fn(),
  onSettingsOpen: jest.fn(),
  metadata: {
    uid: "minikube",
    name: "minikube",
    labels: {}
  }
};

const awsCluster = {
  uid: "aws",
  name: "aws",
  apiVersion: "v1",
  kind: "Cluster",
  status: {
    phase: "Running"
  },
  spec: {},
  getName: jest.fn(),
  getId: jest.fn(),
  onDetailsOpen: jest.fn(),
  onContextMenuOpen: jest.fn(),
  onSettingsOpen: jest.fn(),
  metadata: {
    uid: "aws",
    name: "aws",
    labels: {}
  }
};

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => "99.99.99",
      getPath: () => "tmp",
      getLocale: () => "en",
      setLoginItemSettings: (): void => void 0,
    }
  };
});

describe("HotbarStore", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    ClusterStore.createInstance();

    HotbarStore.resetInstance();
    mockFs({ tmp: { "lens-hotbar-store.json": "{}" } });
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("load", () => {
    it("loads one hotbar by default", () => {
      HotbarStore.createInstance().load();
      expect(HotbarStore.getInstance().hotbars.length).toEqual(1);
    });
  });

  describe("add", () => {
    it("adds a hotbar", () => {
      const hotbarStore = HotbarStore.createInstance();

      hotbarStore.load();
      hotbarStore.add({ name: "hottest" });
      expect(hotbarStore.hotbars.length).toEqual(2);
    });
  });

  describe("hotbar items", () => {
    it("initially creates 12 empty cells", () => {
      const hotbarStore = HotbarStore.createInstance();

      hotbarStore.load();
      expect(hotbarStore.getActive().items.length).toEqual(12);
    });

    it("adds items", () => {
      const hotbarStore = HotbarStore.createInstance();
      const entity = new CatalogEntityItem(testCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(entity);
      const items = hotbarStore.getActive().items.filter(Boolean);

      expect(items.length).toEqual(1);
    });

    it("removes items", () => {
      const hotbarStore = HotbarStore.createInstance();
      const entity = new CatalogEntityItem(testCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(entity);
      hotbarStore.removeFromHotbar("test");
      const items = hotbarStore.getActive().items.filter(Boolean);

      expect(items.length).toEqual(0);
    });

    it("does nothing if removing with invalid uid", () => {
      const hotbarStore = HotbarStore.createInstance();
      const entity = new CatalogEntityItem(testCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(entity);
      hotbarStore.removeFromHotbar("invalid uid");
      const items = hotbarStore.getActive().items.filter(Boolean);

      expect(items.length).toEqual(1);
    });

    it("moves item to empty cell", () => {
      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);
      const minikube = new CatalogEntityItem(minikubeCluster);
      const aws = new CatalogEntityItem(awsCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);
      hotbarStore.addToHotbar(minikube);
      hotbarStore.addToHotbar(aws);

      expect(hotbarStore.getActive().items[5]).toBeNull();

      hotbarStore.restackItems(1, 5);

      expect(hotbarStore.getActive().items[5]).toBeTruthy();
      expect(hotbarStore.getActive().items[5].entity.uid).toEqual("minikube");
    });

    it("moves items down", () => {
      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);
      const minikube = new CatalogEntityItem(minikubeCluster);
      const aws = new CatalogEntityItem(awsCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);
      hotbarStore.addToHotbar(minikube);
      hotbarStore.addToHotbar(aws);

      // aws -> test
      hotbarStore.restackItems(2, 0);

      const items = hotbarStore.getActive().items.map(item => item?.entity.uid || null);

      expect(items.slice(0, 4)).toEqual(["aws", "test", "minikube", null]);
    });

    it("moves items up", () => {
      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);
      const minikube = new CatalogEntityItem(minikubeCluster);
      const aws = new CatalogEntityItem(awsCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);
      hotbarStore.addToHotbar(minikube);
      hotbarStore.addToHotbar(aws);

      // test -> aws
      hotbarStore.restackItems(0, 2);

      const items = hotbarStore.getActive().items.map(item => item?.entity.uid || null);

      expect(items.slice(0, 4)).toEqual(["minikube", "aws", "test", null]);
    });

    it("does nothing when item moved to same cell", () => {
      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);
      hotbarStore.restackItems(0, 0);

      expect(hotbarStore.getActive().items[0].entity.uid).toEqual("test");
    });

    it("new items takes first empty cell", () => {
      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);
      const minikube = new CatalogEntityItem(minikubeCluster);
      const aws = new CatalogEntityItem(awsCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);
      hotbarStore.addToHotbar(aws);
      hotbarStore.restackItems(0, 3);
      hotbarStore.addToHotbar(minikube);

      expect(hotbarStore.getActive().items[0].entity.uid).toEqual("minikube");
    });

    it("throws if invalid arguments provided", () => {
      // Prevent writing to stderr during this render.
      const err = console.error;

      console.error = jest.fn();

      const hotbarStore = HotbarStore.createInstance();
      const test = new CatalogEntityItem(testCluster);

      hotbarStore.load();
      hotbarStore.addToHotbar(test);

      expect(() => hotbarStore.restackItems(-5, 0)).toThrow();
      expect(() => hotbarStore.restackItems(2, -1)).toThrow();
      expect(() => hotbarStore.restackItems(14, 1)).toThrow();
      expect(() => hotbarStore.restackItems(11, 112)).toThrow();

      // Restore writing to stderr.
      console.error = err;
    });
  });

  describe("pre beta-5 migrations", () => {
    beforeEach(() => {
      HotbarStore.resetInstance();
      const mockOpts = {
        "tmp": {
          "lens-hotbar-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.0.0-beta.3"
              }
            },
            "hotbars": [
              {
                "id": "3caac17f-aec2-4723-9694-ad204465d935",
                "name": "myhotbar",
                "items": [
                  {
                    "entity": {
                      "uid": "1dfa26e2ebab15780a3547e9c7fa785c"
                    }
                  },
                  {
                    "entity": {
                      "uid": "55b42c3c7ba3b04193416cda405269a5"
                    }
                  },
                  {
                    "entity": {
                      "uid": "176fd331968660832f62283219d7eb6e"
                    }
                  },
                  {
                    "entity": {
                      "uid": "61c4fb45528840ebad1badc25da41d14",
                      "name": "user1-context",
                      "source": "local"
                    }
                  },
                  {
                    "entity": {
                      "uid": "27d6f99fe9e7548a6e306760bfe19969",
                      "name": "foo2",
                      "source": "local"
                    }
                  },
                  null,
                  {
                    "entity": {
                      "uid": "c0b20040646849bb4dcf773e43a0bf27",
                      "name": "multinode-demo",
                      "source": "local"
                    }
                  },
                  null,
                  null,
                  null,
                  null,
                  null
                ]
              }
            ],
          })
        }
      };

      mockFs(mockOpts);

      return HotbarStore.createInstance().load();
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows to retrieve a hotbar", () => {
      const hotbar = HotbarStore.getInstance().getById("3caac17f-aec2-4723-9694-ad204465d935");

      expect(hotbar.id).toBe("3caac17f-aec2-4723-9694-ad204465d935");
    });

    it("clears cells without entity", () => {
      const items = HotbarStore.getInstance().hotbars[0].items;

      expect(items[2]).toBeNull();
    });

    it("adds extra data to cells with according entity", () => {
      const items = HotbarStore.getInstance().hotbars[0].items;

      expect(items[0]).toEqual({
        entity: {
          name: "mycluster",
          source: "local",
          uid: "1dfa26e2ebab15780a3547e9c7fa785c"
        }
      });

      expect(items[1]).toEqual({
        entity: {
          name: "my_shiny_cluster",
          source: "remote",
          uid: "55b42c3c7ba3b04193416cda405269a5"
        }
      });
    });
  });
});
