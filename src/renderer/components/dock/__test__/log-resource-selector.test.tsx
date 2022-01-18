/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import * as selectEvent from "react-select-event";
import { Pod } from "../../../../common/k8s-api/endpoints";
import { LogResourceSelector } from "../log-resource-selector";
import type { LogTabData } from "../log-tab-store/log-tab.store";
import { dockerPod, deploymentPod1 } from "./pod.mock";
import { ThemeStore } from "../../../theme.store";
import { UserStore } from "../../../../common/user-store";
import mockFs from "mock-fs";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import callForLogsInjectable from "../log-store/call-for-logs/call-for-logs.injectable";

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

const getComponent = (tabData: LogTabData) => {
  return (
    <LogResourceSelector
      tabId="tabId"
      tabData={tabData}
      save={jest.fn()}
    />
  );
};

const getOnePodTabData = (): LogTabData => {
  const selectedPod = new Pod(dockerPod);

  return {
    pods: [] as Pod[],
    selectedPod,
    selectedContainer: selectedPod.getContainers()[0],
  };
};

const getFewPodsTabData = (): LogTabData => {
  const selectedPod = new Pod(deploymentPod1);
  const anotherPod = new Pod(dockerPod);

  return {
    pods: [anotherPod],
    selectedPod,
    selectedContainer: selectedPod.getContainers()[0],
  };
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
    const tabData = getOnePodTabData();
    const { container } = render(getComponent(tabData));

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders proper namespace", () => {
    const tabData = getOnePodTabData();
    const { getByTestId } = render(getComponent(tabData));
    const ns = getByTestId("namespace-badge");

    expect(ns).toHaveTextContent("default");
  });

  it("renders proper selected items within dropdowns", () => {
    const tabData = getOnePodTabData();
    const { getByText } = render(getComponent(tabData));

    expect(getByText("dockerExporter")).toBeInTheDocument();
    expect(getByText("docker-exporter")).toBeInTheDocument();
  });

  it("renders sibling pods in dropdown", () => {
    const tabData = getFewPodsTabData();
    const { container, getByText } = render(getComponent(tabData));
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(getByText("dockerExporter")).toBeInTheDocument();
    expect(getByText("deploymentPod1")).toBeInTheDocument();
  });

  it("renders sibling containers in dropdown", () => {
    const tabData = getFewPodsTabData();
    const { getByText, container } = render(getComponent(tabData));
    const containerSelector: HTMLElement = container.querySelector(".container-selector");

    selectEvent.openMenu(containerSelector);

    expect(getByText("node-exporter-1")).toBeInTheDocument();
    expect(getByText("init-node-exporter")).toBeInTheDocument();
    expect(getByText("init-node-exporter-1")).toBeInTheDocument();
  });

  it("renders pod owner as dropdown title", () => {
    const tabData = getFewPodsTabData();
    const { getByText, container } = render(getComponent(tabData));
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(getByText("super-deployment")).toBeInTheDocument();
  });
});
