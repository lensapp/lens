import mockFs from "mock-fs";
import { HotbarStore, hotbarStore } from "../hotbar-store";

describe("HotbarStore", () => {
  beforeEach(() => {
    HotbarStore.resetInstance();
    mockFs({ tmp: { "lens-hotbar-store.json": "{}" } });
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("load", () => {
    it("loads one hotbar by default", () => {
      hotbarStore.load();
      expect(hotbarStore.hotbars.length).toEqual(1);
    });
  });
});
