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
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import * as selectEvent from "react-select-event";

import { Pod } from "../../../../common/k8s-api/endpoints";
import { LogResourceSelector } from "../log-resource-selector";
import type { LogTabData } from "../log-tab.store";
import { dockerPod, deploymentPod1 } from "./pod.mock";
import { ThemeStore } from "../../../theme.store";
import { UserStore } from "../../../../common/user-store";
import mockFs from "mock-fs";
import { AppPaths } from "../../../../common/app-paths";

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

const getComponent = (tabData: LogTabData) => {
  return (
    <LogResourceSelector
      tabId="tabId"
      tabData={tabData}
      save={jest.fn()}
      reload={jest.fn()}
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
  beforeEach(() => {
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
