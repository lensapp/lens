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

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import fse from "fs-extra";

import { DockTabs } from "../dock-tabs";
import { dockStore, DockTab, TabKind } from "../dock.store";
import { noop } from "../../../utils";
import { ThemeStore } from "../../../theme.store";
import { TerminalStore } from "../terminal.store";
import { UserStore } from "../../../../common/user-store";
import { AppPaths } from "../../../../common/app-paths";

jest.mock("react-monaco-editor", () => ({
  monaco: {
    editor: {
      getModel: jest.fn(),
    },
  },
}));

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

const initialTabs: DockTab[] = [
  { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
  { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
  { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
  { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
  { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
];

const getComponent = () => (
  <DockTabs
    tabs={dockStore.tabs}
    selectedTab={dockStore.selectedTab}
    autoFocus={true}
    onChangeTab={noop}
  />
);

const renderTabs = () => render(getComponent());
const getTabKinds = () => dockStore.tabs.map(tab => tab.kind);

describe("<DockTabs />", () => {
  beforeEach(async () => {
    UserStore.createInstance();
    ThemeStore.createInstance();
    TerminalStore.createInstance();
    await dockStore.whenReady;
    dockStore.tabs = initialTabs;
  });

  afterEach(() => {
    ThemeStore.resetInstance();
    TerminalStore.resetInstance();
    UserStore.resetInstance();
    fse.remove("tmp");
  });

  it("renders w/o errors", () => {
    const { container } = renderTabs();

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("has 6 tabs (1 tab is initial terminal)", () => {
    const { container } = renderTabs();
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(initialTabs.length);
  });

  it("opens a context menu", () => {
    const { container, getByText } = renderTabs();
    const tab = container.querySelector(".Tab");

    fireEvent.contextMenu(tab);
    expect(getByText("Close all tabs")).toBeInTheDocument();
  });

  it("closes selected tab", () => {
    const { container, getByText, rerender } = renderTabs();
    const tab = container.querySelector(".Tab");

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close"));
    rerender(getComponent());

    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(initialTabs.length - 1);
    expect(getTabKinds()).toEqual([
      TabKind.CREATE_RESOURCE,
      TabKind.EDIT_RESOURCE,
      TabKind.INSTALL_CHART,
      TabKind.POD_LOGS,
    ]);
  });

  it("closes other tabs", () => {
    const { container, getByText, rerender } = renderTabs();
    const tab = container.querySelectorAll(".Tab")[3];

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close other tabs"));
    rerender(getComponent());

    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(1);
    expect(getTabKinds()).toEqual([initialTabs[3].kind]);
  });

  it("closes all tabs", () => {
    const { container, getByText, rerender } = renderTabs();
    const tab = container.querySelector(".Tab");

    fireEvent.contextMenu(tab);
    const command = getByText("Close all tabs");

    fireEvent.click(command);
    rerender(getComponent());
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(0);
  });

  it("closes tabs to the right", () => {
    const { container, getByText, rerender } = renderTabs();
    const tab = container.querySelectorAll(".Tab")[3]; // 4th of 5

    fireEvent.contextMenu(tab);
    fireEvent.click(getByText("Close tabs to the right"));
    rerender(getComponent());

    expect(getTabKinds()).toEqual(
      initialTabs.slice(0, 4).map(tab => tab.kind),
    );
  });

  it("disables 'Close All' & 'Close Other' items if only 1 tab available", () => {
    dockStore.tabs = [{
      id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false,
    }];
    const { container, getByText } = renderTabs();
    const tab = container.querySelector(".Tab");

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
    const { container, getByText } = renderTabs();
    const tab = container.querySelectorAll(".Tab")[1];

    fireEvent.contextMenu(tab);
    const command = getByText("Close tabs to the right");

    expect(command).toHaveClass("disabled");
  });
});
