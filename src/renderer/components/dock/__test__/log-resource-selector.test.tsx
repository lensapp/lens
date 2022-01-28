/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import * as selectEvent from "react-select-event";

import { Pod, PodApi } from "../../../../common/k8s-api/endpoints";
import { LogResourceSelector } from "../logs/log-resource-selector";
import type { LogTabData } from "../log-tab/store";
import { dockerPod, deploymentPod1 } from "./pod.mock";
import mockFs from "mock-fs";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import podStoreInjectable from "../../+pods/store.injectable";
import { PodStore } from "../../+pods/store";
import type { TabId } from "../dock/store";
import logTabManagerInjectable from "../logs/log-tab-manager.injectable";

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
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;
  let renameTab: jest.Mock<(tabId: TabId) => void>;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    renameTab = jest.fn();

    di.override(podStoreInjectable, () => new PodStore(new PodApi()));
    di.override(logTabManagerInjectable, () => ({
      renameTab,
    }));
  });

  beforeEach(() => {
    mockFs({
      "tmp": {},
    });
  });

  afterEach(() => {
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
