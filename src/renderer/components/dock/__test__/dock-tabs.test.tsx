/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import fse from "fs-extra";
import { DockTabs } from "../dock-tabs";
import type { DockStore, DockTab } from "../dock/store";
import { TabKind } from "../dock/store";
import { noop } from "../../../utils";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import dockStoreInjectable from "../dock/store.injectable";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable from "../../../../common/get-configuration-file-model/app-version/app-version.injectable";
import assert from "assert";
import hostedClusterIdInjectable from "../../../../common/cluster-store/hosted-cluster-id.injectable";
import ipcRendererInjectable from "../../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

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
  ipcRenderer: {
    on: jest.fn(),
    invoke: jest.fn(),
  },
}));

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  })),
});

const initialTabs: DockTab[] = [
  { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
  { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
  { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
  { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
  { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
];

const getComponent = (dockStore: DockStore) => (
  <DockTabs
    tabs={dockStore.tabs}
    selectedTab={dockStore.selectedTab}
    autoFocus={true}
    onChangeTab={noop}
  />
);

const getTabKinds = (dockStore: DockStore) => dockStore.tabs.map((tab) => tab.kind);

describe("<DockTabs />", () => {
  let dockStore: DockStore;
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);

    di.override(hostedClusterIdInjectable, () => "some-cluster-id");
    di.override(
      directoryForUserDataInjectable,
      () => "some-test-suite-specific-directory-for-user-data",
    );
    di.override(ipcRendererInjectable, () => ({
      on: jest.fn(),
      invoke: jest.fn(), // TODO: replace with proper mocking via the IPC bridge
    } as never));

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);

    await di.runSetups();

    dockStore = di.inject(dockStoreInjectable);

    await dockStore.whenReady;
    dockStore.tabs = initialTabs;
  });

  afterEach(() => {
    // TODO: A unit test may not cause side effects. Here accessing file system is a side effect.
    fse.remove("some-test-suite-specific-directory-for-user-data");
  });

  it("renders w/o errors", () => {
    const { container } = render(getComponent(dockStore));

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("has 6 tabs (1 tab is initial terminal)", () => {
    const { container } = render(getComponent(dockStore));
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(initialTabs.length);
  });

  it("opens a context menu", () => {
    const { container, getByText } = render(getComponent(dockStore));
    const tab = container.querySelector(".Tab");

    assert(tab);

    fireEvent.contextMenu(tab);
    expect(getByText("Close all tabs")).toBeInTheDocument();
  });

  it("closes selected tab", () => {
    const { container, getByText, rerender } = render(
      getComponent(dockStore),
    );

    const tab = container.querySelector(".Tab");

    assert(tab);

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close"));

    rerender(getComponent(dockStore));

    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(initialTabs.length - 1);

    expect(getTabKinds(dockStore)).toEqual([
      TabKind.CREATE_RESOURCE,
      TabKind.EDIT_RESOURCE,
      TabKind.INSTALL_CHART,
      TabKind.POD_LOGS,
    ]);
  });

  it("closes other tabs", () => {
    const { container, getByText, rerender } = render(getComponent(dockStore));
    const tab = container.querySelectorAll(".Tab")[3];

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close other tabs"));
    rerender(getComponent(dockStore));

    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(1);
    expect(getTabKinds(dockStore)).toEqual([initialTabs[3].kind]);
  });

  it("closes all tabs", () => {
    const { container, getByText, rerender } = render(getComponent(dockStore));
    const tab = container.querySelector(".Tab");

    assert(tab);

    fireEvent.contextMenu(tab);
    const command = getByText("Close all tabs");

    fireEvent.click(command);
    rerender(getComponent(dockStore));
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(0);
  });

  it("closes tabs to the right", () => {
    const { container, getByText, rerender } = render(getComponent(dockStore));
    const tab = container.querySelectorAll(".Tab")[3]; // 4th of 5

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close tabs to the right"));
    rerender(getComponent(dockStore));

    expect(getTabKinds(dockStore)).toEqual(
      initialTabs.slice(0, 4).map(tab => tab.kind),
    );
  });

  it("disables 'Close All' & 'Close Other' items if only 1 tab available", () => {
    dockStore.tabs = [{
      id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false,
    }];
    const { container, getByText } = render(getComponent(dockStore));
    const tab = container.querySelector(".Tab");

    assert(tab);

    fireEvent.contextMenu(tab);
    const closeAll = getByText("Close all tabs");
    const closeOthers = getByText("Close other tabs");

    expect(closeAll).toHaveClass("disabled");
    expect(closeOthers).toHaveClass("disabled");
  });

  it("disables 'Close To The Right' item if last tab clicked", () => {
    dockStore.tabs = [
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Pod Logs", pinned: false },
    ];
    const { container, getByText } = render(getComponent(dockStore));
    const tab = container.querySelectorAll(".Tab")[1];

    fireEvent.contextMenu(tab);
    const command = getByText("Close tabs to the right");

    expect(command).toHaveClass("disabled");
  });
});
