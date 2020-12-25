import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { DockTabs } from "../dock-tabs";
import { dockStore, IDockTab, TabKind } from "../dock.store";
import { createResourceTab } from "../create-resource.store";
import { createTerminalTab } from "../terminal.store";
import { observable } from "mobx";

const onChangeTab = jest.fn();

const getComponent = () => (
  <DockTabs
    tabs={dockStore.tabs}
    selectedTab={dockStore.selectedTab}
    autoFocus={true}
    onChangeTab={onChangeTab}
  />
);

const renderTabs = () => render(getComponent());

const getTabKinds = () => dockStore.tabs.map(tab => tab.kind);

describe("<DockTabs />", () => {
  beforeEach(() => {
    createTerminalTab();
    createResourceTab();
    createTerminalTab();
    createResourceTab();
    createTerminalTab();
  });

  afterEach(() => {
    dockStore.reset();
  });

  it("renders w/o errors", () => {
    const { container } = renderTabs();

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("has 6 tabs (1 tab is initial terminal)", () => {
    const { container } = renderTabs();
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(6);
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
    const command = getByText("Close");

    fireEvent.click(command);
    rerender(getComponent());
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(5);
    expect(getTabKinds()).toEqual([
      TabKind.TERMINAL,
      TabKind.CREATE_RESOURCE,
      TabKind.TERMINAL,
      TabKind.CREATE_RESOURCE,
      TabKind.TERMINAL
    ]);
  });

  it("closes other tabs", () => {
    const { container, getByText, rerender } = renderTabs();
    const tab = container.querySelectorAll(".Tab")[3];

    fireEvent.contextMenu(tab);
    const command = getByText("Close other tabs");

    fireEvent.click(command);
    rerender(getComponent());
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(1);
    expect(getTabKinds()).toEqual([TabKind.TERMINAL]);
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
    const tab = container.querySelectorAll(".Tab")[3];

    fireEvent.contextMenu(tab);
    const command = getByText("Close tabs to the right");

    fireEvent.click(command);
    rerender(getComponent());
    const tabs = container.querySelectorAll(".Tab");

    expect(tabs.length).toBe(4);
    expect(getTabKinds()).toEqual([
      TabKind.TERMINAL,
      TabKind.TERMINAL,
      TabKind.CREATE_RESOURCE,
      TabKind.TERMINAL
    ]);
  });

  it("disables 'Close All' & 'Close Other' items if only 1 tab available", () => {
    dockStore.tabs = observable.array<IDockTab>([{
      id: "terminal", kind: TabKind.TERMINAL, title: "Terminal"
    }]);
    const { container, getByText } = renderTabs();
    const tab = container.querySelector(".Tab");

    fireEvent.contextMenu(tab);
    const closeAll = getByText("Close all tabs");
    const closeOthers = getByText("Close other tabs");

    expect(closeAll).toHaveClass("disabled");
    expect(closeOthers).toHaveClass("disabled");
  });

  it("disables 'Close To The Right' item if last tab clicked", () => {
    dockStore.tabs = observable.array<IDockTab>([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal" },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Pod Logs" },
    ]);
    const { container, getByText } = renderTabs();
    const tab = container.querySelectorAll(".Tab")[1];

    fireEvent.contextMenu(tab);
    const command = getByText("Close tabs to the right");

    expect(command).toHaveClass("disabled");
  });
});
