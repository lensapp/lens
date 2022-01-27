/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import * as selectEvent from "react-select-event";
import { Pod } from "../../../../../common/k8s-api/endpoints";
import { LogResourceSelector } from "../resource-selector";
import { dockerPod, deploymentPod1 } from "./pod.mock";
import { ThemeStore } from "../../../../theme.store";
import { UserStore } from "../../../../../common/user-store";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import callForLogsInjectable from "../call-for-logs.injectable";
import { LogTabViewModel, LogTabViewModelDependencies } from "../logs-view-model";
import type { TabId } from "../../dock-store/dock.store";

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

const getComponent = (model: LogTabViewModel) => (
  <LogResourceSelector model={model} />
);

function mockLogTabViewModel(tabId: TabId, deps: Partial<LogTabViewModelDependencies>): LogTabViewModel {
  return new LogTabViewModel(tabId, {
    getLogs: jest.fn(),
    getLogsWithoutTimestamps: jest.fn(),
    getTimestampSplitLogs: jest.fn(),
    getLogTabData: jest.fn(),
    setLogTabData: jest.fn(),
    loadLogs: jest.fn(),
    reloadLogs: jest.fn(),
    updateTabName: jest.fn(),
    stopLoadingLogs: jest.fn(),
    ...deps,
  });
}

const getOnePodViewModel = (tabId: TabId): LogTabViewModel => {
  const selectedPod = new Pod(dockerPod);

  return mockLogTabViewModel(tabId, {
    getLogTabData: () => ({
      pods: [selectedPod],
      selectedPod,
      selectedContainer: selectedPod.getContainers()[0],
    }),
  });
};

const getFewPodsTabData = (tabId: TabId): LogTabViewModel => {
  const selectedPod = new Pod(deploymentPod1);
  const anotherPod = new Pod(dockerPod);

  return mockLogTabViewModel(tabId, {
    getLogTabData: () => ({
      pods: [selectedPod, anotherPod],
      selectedPod,
      selectedContainer: selectedPod.getContainers()[0],
    }),
  });
};

describe("<LogResourceSelector />", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(callForLogsInjectable, () => () => Promise.resolve("some-logs"));

    render = renderFor(di);

    await di.runSetups();

    mockFs({
      "tmp": {},
    });

    UserStore.createInstance();
    ThemeStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
    ThemeStore.resetInstance();
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const model = getOnePodViewModel("foobar");
    const { container } = render(getComponent(model));

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders proper namespace", async () => {
    const model = getOnePodViewModel("foobar");
    const { findByTestId } = render(getComponent(model));
    const ns = await findByTestId("namespace-badge");

    expect(ns).toHaveTextContent("default");
  });

  it("renders proper selected items within dropdowns", async () => {
    const model = getOnePodViewModel("foobar");
    const { findByText } = render(getComponent(model));

    expect(await findByText("dockerExporter")).toBeInTheDocument();
    expect(await findByText("docker-exporter")).toBeInTheDocument();
  });

  it("renders sibling pods in dropdown", async () => {
    const model = getFewPodsTabData("foobar");
    const { container, findByText } = render(getComponent(model));

    selectEvent.openMenu(container.querySelector(".pod-selector"));

    expect(await findByText("dockerExporter", { selector: ".pod-selector-menu .Select__option" })).toBeInTheDocument();
    expect(await findByText("deploymentPod1", { selector: ".pod-selector-menu .Select__option" })).toBeInTheDocument();
  });

  it("renders sibling containers in dropdown", async () => {
    const model = getFewPodsTabData("foobar");
    const { findByText, container } = render(getComponent(model));
    const containerSelector: HTMLElement = container.querySelector(".container-selector");

    selectEvent.openMenu(containerSelector);

    expect(await findByText("node-exporter-1")).toBeInTheDocument();
    expect(await findByText("init-node-exporter")).toBeInTheDocument();
    expect(await findByText("init-node-exporter-1")).toBeInTheDocument();
  });

  it("renders pod owner as dropdown title", async () => {
    const model = getFewPodsTabData("foobar");
    const { findByText, container } = render(getComponent(model));
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(await findByText("super-deployment")).toBeInTheDocument();
  });
});
