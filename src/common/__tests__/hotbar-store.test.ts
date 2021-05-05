import mockFs from "mock-fs";
import { CatalogEntityItem } from "../../renderer/components/+catalog/catalog-entity.store";
import { ClusterStore } from "../cluster-store";
import { HotbarStore } from "../hotbar-store";

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
});
