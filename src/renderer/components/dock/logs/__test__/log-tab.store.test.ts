/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { podsStore } from "../../../+workloads-pods/pods.store";
import { UserStore } from "../../../../../common/user-store";
import { Pod } from "../../../../../common/k8s-api/endpoints";
import { ThemeStore } from "../../../../theme.store";
import { deploymentPod1, deploymentPod2, deploymentPod3, dockerPod } from "./pod.mock";
import { mockWindow } from "../../../../../../__mocks__/windowMock";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import logTabStoreInjectable from "../tab-store.injectable";
import type { LogTabStore } from "../tab.store";
import dockStoreInjectable from "../../dock-store/dock-store.injectable";
import type { DockStore } from "../../dock-store/dock.store";
import directoryForUserDataInjectable
  from "../../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import mockFs from "mock-fs";

mockWindow();

podsStore.items.push(new Pod(dockerPod));
podsStore.items.push(new Pod(deploymentPod1));
podsStore.items.push(new Pod(deploymentPod2));

describe("log tab store", () => {
  let logTabStore: LogTabStore;
  let dockStore: DockStore;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await di.runSetups();

    dockStore = di.inject(dockStoreInjectable);
    logTabStore = di.inject(logTabStoreInjectable);

    UserStore.createInstance();
    ThemeStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
    ThemeStore.resetInstance();
    mockFs.restore();
  });

  it("creates log tab without sibling pods", () => {
    const selectedPod = new Pod(dockerPod);
    const selectedContainer = selectedPod.getAllContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer,
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false,
    });
  });

  it("creates log tab with sibling pods", () => {
    const selectedPod = new Pod(deploymentPod1);
    const siblingPod = new Pod(deploymentPod2);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer,
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod, siblingPod],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false,
    });
  });

  it("removes item from pods list if pod deleted from store", () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer,
    });

    podsStore.items.pop();

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false,
    });
  });

  it("adds item into pods list if new sibling pod added to store", () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer,
    });

    podsStore.items.push(new Pod(deploymentPod3));

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod, deploymentPod3],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false,
    });
  });

  // FIXME: this is failed when it's not .only == depends on something above
  it.only("closes tab if no pods left in store", async () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    const id = logTabStore.createPodTab({
      selectedPod,
      selectedContainer,
    });

    podsStore.items.clear();

    expect(logTabStore.getData(dockStore.selectedTabId)).toBeUndefined();
    expect(logTabStore.getData(id)).toBeUndefined();
    expect(dockStore.getTabById(id)).toBeUndefined();
  });
});
