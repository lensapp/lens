/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import hostedClusterIdInjectable from "../../../../common/cluster-store/hosted-cluster-id.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DockStore, DockTab } from "../dock/store";
import { TabKind } from "../dock/store";
import dockStoreInjectable from "../dock/store.injectable";

const initialTabs: DockTab[] = [
  { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
  { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
  { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
  { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
  { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
];

describe("DockStore", () => {
  let dockStore: DockStore;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(hostedClusterIdInjectable, () => "some-cluster-id");

    await di.runSetups();

    dockStore = di.inject(dockStoreInjectable);
  });

  it("closes tab and selects one from right", () => {
    dockStore.tabs = initialTabs;
    dockStore.closeTab(dockStore.tabs[0].id);

    expect(dockStore.selectedTabId).toBe("create");

    dockStore.selectTab("edit");
    dockStore.closeTab("edit");

    expect(dockStore.selectedTabId).toBe("install");
  });

  it("closes last tab and selects one from right", () => {
    dockStore.tabs = initialTabs;
    dockStore.selectTab("logs");
    dockStore.closeTab("logs");

    expect(dockStore.selectedTabId).toBe("install");
  });

  it("closes tab and selects the last one", () => {
    dockStore.tabs = [
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
    ];
    dockStore.closeTab("terminal");

    expect(dockStore.selectedTabId).toBe("create");
  });

  it("closes last tab and selects none", () => {
    dockStore.tabs = [
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
    ];
    dockStore.closeTab("create");

    expect(dockStore.selectedTabId).toBeUndefined();
  });

  it("doesn't change selected tab if other tab closed", () => {
    dockStore.tabs = initialTabs;
    dockStore.closeTab("install");

    expect(dockStore.selectedTabId).toBe("terminal");
  });
});
