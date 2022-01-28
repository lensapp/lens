/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { DockTabs } from "../dock-tab/dock-tabs";
import { TabKind } from "../dock/store";
import { noop } from "../../../utils";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import { observable } from "mobx";
import closeDockTabInjectable from "../dock/close-tab.injectable";
import isTerminalDisconnectedInjectable from "../terminal/is-disconnected.injectable";
import reconnectTerminalInjectable from "../terminal/reconnect.injectable";
import closeAllDockTabsInjectable from "../dock/close-all-tabs.injectable";
import closeOtherDockTabsInjectable from "../dock/close-other-tabs.injectable";
import closeDockTabsToTheRightInjectable from "../dock/close-tabs-right.injectable";


describe("<DockTabs />", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;
  let closeDockTab: jest.Mock<any, any>;
  let closeAllDockTabs: jest.Mock<any, any>;
  let closeOtherDockTabs: jest.Mock<any, any>;
  let closeDockTabsToTheRight: jest.Mock<any, any>;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);
    closeDockTab = jest.fn();
    closeOtherDockTabs = jest.fn();
    closeAllDockTabs = jest.fn();
    closeDockTabsToTheRight = jest.fn();

    di.override(closeDockTabInjectable, () => closeDockTab);
    di.override(closeAllDockTabsInjectable, () => closeAllDockTabs);
    di.override(closeOtherDockTabsInjectable, () => closeOtherDockTabs);
    di.override(closeDockTabsToTheRightInjectable, () => closeDockTabsToTheRight);
    di.override(isTerminalDisconnectedInjectable, () => () => false);
    di.override(reconnectTerminalInjectable, () => noop);
  });

  it("renders all 5 tabs", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    expect(container.querySelectorAll(".Tab").length).toBe(5);
  });

  it("opens a context menu", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelector(".Tab"));

    expect(getByText("Close all tabs")).toBeInTheDocument();
  });

  it("calls closeDockTab()", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelector(".Tab"));
    fireEvent.click(getByText("Close"));

    expect(closeDockTab).toBeCalledTimes(1);
  });

  it("calls closeOtherDockTabs()", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelectorAll(".Tab")[3]);
    fireEvent.click(getByText("Close other tabs"));

    expect(closeOtherDockTabs).toBeCalledTimes(1);
  });

  it("calls closeAllDockTabs()", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelector(".Tab"));
    fireEvent.click(getByText("Close all tabs"));

    expect(closeAllDockTabs).toBeCalledTimes(1);
  });

  it("calls closeDockTabsToTheRight()", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "create", kind: TabKind.CREATE_RESOURCE, title: "Create resource", pinned: false },
      { id: "edit", kind: TabKind.EDIT_RESOURCE, title: "Edit resource", pinned: false },
      { id: "install", kind: TabKind.INSTALL_CHART, title: "Install chart", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelectorAll(".Tab")[3]);
    fireEvent.click(getByText("Close tabs to the right"));

    expect(closeDockTabsToTheRight).toBeCalledTimes(1);
  });

  it("disables 'Close Other' items if only 1 tab available", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelector(".Tab"));

    expect(getByText("Close other tabs")).toHaveClass("disabled");
  });

  it("disables 'Close To The Right' item if last tab clicked", () => {
    const tabs = observable.array([
      { id: "terminal", kind: TabKind.TERMINAL, title: "Terminal", pinned: false },
      { id: "logs", kind: TabKind.POD_LOGS, title: "Pod Logs", pinned: false },
    ]);
    const { container, getByText } = render(
      <DockTabs
        tabs={tabs}
        selectedTab={undefined}
        autoFocus={true}
        onChangeTab={noop}
      />,
    );

    fireEvent.contextMenu(container.querySelectorAll(".Tab")[1]);

    expect(getByText("Close tabs to the right")).toHaveClass("disabled");
  });
});
