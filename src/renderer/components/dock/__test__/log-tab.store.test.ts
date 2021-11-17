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

import { Pod } from "../../../../common/k8s-api/endpoints";
import type { TabId } from "../dock.store";
import { DockManager, LogTabStore } from "../log-tab.store";
import { deploymentPod1, dockerPod, noOwnersPod } from "./pod.mock";

function getMockDockManager(): jest.Mocked<DockManager> {
  return {
    renameTab: jest.fn(),
    createTab: jest.fn(),
    closeTab: jest.fn(),
  };
}

describe("LogTabStore", () => {
  describe("createPodTab()", () => {
    it("throws if data is not an object", () => {
      const dockManager = getMockDockManager();
      const logTabStore = new LogTabStore({ autoInit: false }, dockManager);

      expect(() => logTabStore.createPodTab(0 as any)).toThrow(/is not an object/);
    });

    it("throws if data.selectedPod is not an object", () => {
      const dockManager = getMockDockManager();
      const logTabStore = new LogTabStore({ autoInit: false }, dockManager);

      expect(() => logTabStore.createPodTab({ selectedPod: 1 as any, selectedContainer: {} as any })).toThrow(/is not an object/);
    });

    it("throws if data.selectedContainer is not an object", () => {
      const dockManager = getMockDockManager();
      const logTabStore = new LogTabStore({ autoInit: false }, dockManager);

      expect(() => logTabStore.createPodTab({ selectedContainer: 1 as any, selectedPod: {} as any })).toThrow(/is not an object/);
    });

    it("does not throw if selectedPod has no owner refs", () => {
      const dockManager = getMockDockManager();
      const logTabStore = new LogTabStore({ autoInit: false }, dockManager);
      const pod = new Pod(noOwnersPod);

      expect(() => logTabStore.createPodTab({ selectedContainer: {} as any, selectedPod: pod })).not.toThrow();
    });

    it("should return a TabId if created sucessfully", () => {
      const dockManager = getMockDockManager();
      const logTabStore = new LogTabStore({ autoInit: false }, dockManager);
      const pod = new Pod(dockerPod);

      expect(typeof logTabStore.createPodTab({ selectedContainer: { name: "docker-exporter" } as any, selectedPod: pod })).toBe("string");
    });
  });

  describe("changeSelectedPod()", () => {
    let dockManager: jest.Mocked<DockManager>;
    let logTabStore: LogTabStore;
    let tabId: TabId;
    const pod = new Pod(dockerPod);

    beforeEach(() => {
      dockManager = getMockDockManager();
      logTabStore = new LogTabStore({ autoInit: false }, dockManager);
      tabId = logTabStore.createPodTab({ selectedContainer: { name: "docker-exporter" } as any, selectedPod: pod });
    });

    it("should work as expected", () => {
      const newPod = new Pod(deploymentPod1);

      logTabStore.changeSelectedPod(tabId, newPod);

      expect(logTabStore.getData(tabId)).toMatchObject({
        selectedPod: newPod.getId(),
        selectedContainer: newPod.getContainers()[0].name,
      });
    });

    it("should rename the tab", () => {
      const newPod = new Pod(deploymentPod1);

      logTabStore.changeSelectedPod(tabId, newPod);
      expect(dockManager.renameTab).toBeCalledWith(tabId, "Pod Logs: deploymentPod1");
    });
  });

  describe("getData()", () => {
    let dockManager: jest.Mocked<DockManager>;
    let logTabStore: LogTabStore;
    let tabId: TabId;
    const pod = new Pod(dockerPod);

    beforeEach(() => {
      dockManager = getMockDockManager();
      logTabStore = new LogTabStore({ autoInit: false }, dockManager);
      tabId = logTabStore.createPodTab({ selectedContainer: { name: "docker-exporter" } as any, selectedPod: pod });
    });

    it("should return data if created", () => {
      expect(logTabStore.getData(tabId)).toMatchObject({
        selectedPod: pod.getId(),
        selectedContainer: "docker-exporter",
      });
    });

    it("should return undefined for unknown tab ID", () => {
      expect(logTabStore.getData("foo")).toBeUndefined();
    });
  });

  describe("setData()", () => {
    let dockManager: jest.Mocked<DockManager>;
    let logTabStore: LogTabStore;

    beforeEach(() => {
      dockManager = getMockDockManager();
      logTabStore = new LogTabStore({ autoInit: false }, dockManager);
    });

    it("should throw an error on invalid data", () => {
      expect(() => logTabStore.setData("foo", 7 as any)).toThrowError();
    });

    it("should not throw an error on valid data", () => {
      expect(() => logTabStore.setData("foo", {
        namespace: "foobar",
        previous: false,
        selectedPod: "blat",
        showTimestamps:  false,
        podsOwner: "bar",
        selectedContainer: "bat",
      })).not.toThrowError();
      expect(logTabStore.getData("foo")).toBeDefined();
    });
  });
});
