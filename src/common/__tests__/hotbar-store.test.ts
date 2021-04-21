import mockFs from "mock-fs";
import { ClusterStore } from "../cluster-store";
import { HotbarStore } from "../hotbar-store";

describe("HotbarStore", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    ClusterStore.getInstanceOrCreate();

    HotbarStore.resetInstance();
    mockFs({ tmp: { "lens-hotbar-store.json": "{}" } });
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("load", () => {
    it("loads one hotbar by default", () => {
      HotbarStore.getInstanceOrCreate().load();
      expect(HotbarStore.getInstance().hotbars.length).toEqual(1);
    });
  });
});
