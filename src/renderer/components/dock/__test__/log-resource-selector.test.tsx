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
import { LogResourceSelector, LogResourceSelectorProps } from "../log-resource-selector";
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

const getOnePodTabProps = (): LogResourceSelectorProps => {
  const selectedPod = new Pod(dockerPod);

  return {
    pod: selectedPod,
    pods: [selectedPod],
    tabId: "tabId",
    selectedContainer: selectedPod.getContainers()[0].name,
  };
};

const getFewPodsTabProps = (): LogResourceSelectorProps => {
  const selectedPod = new Pod(deploymentPod1);
  const anotherPod = new Pod(dockerPod);

  return {
    pod: selectedPod,
    pods: [selectedPod, anotherPod],
    tabId: "tabId",
    selectedContainer: selectedPod.getContainers()[0].name,
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
    const props = getOnePodTabProps();
    const { container } = render(<LogResourceSelector {...props} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders proper namespace", () => {
    const props = getOnePodTabProps();
    const { getByTestId } = render(<LogResourceSelector {...props} />);
    const ns = getByTestId("namespace-badge");

    expect(ns).toHaveTextContent("default");
  });

  it("renders proper selected items within dropdowns", () => {
    const props = getOnePodTabProps();
    const { getByText } = render(<LogResourceSelector {...props} />);

    expect(getByText("dockerExporter")).toBeInTheDocument();
    expect(getByText("docker-exporter")).toBeInTheDocument();
  });

  it("renders sibling pods in dropdown", () => {
    const props = getFewPodsTabProps();
    const { container, getByText } = render(<LogResourceSelector {...props} />);
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(getByText("dockerExporter", {
      selector: ".Select__option",
    })).toBeInTheDocument();
    expect(getByText("deploymentPod1", {
      selector: ".Select__option",
    })).toBeInTheDocument();
  });

  it("renders sibling containers in dropdown", () => {
    const props = getFewPodsTabProps();
    const { getByText, container } = render(<LogResourceSelector {...props} />);
    const containerSelector: HTMLElement = container.querySelector(".container-selector");

    selectEvent.openMenu(containerSelector);

    expect(getByText("node-exporter-1")).toBeInTheDocument();
    expect(getByText("init-node-exporter")).toBeInTheDocument();
    expect(getByText("init-node-exporter-1")).toBeInTheDocument();
  });

  it("renders pod owner as dropdown title", () => {
    const props = getFewPodsTabProps();
    const { getByText, container } = render(<LogResourceSelector {...props} />);
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(getByText("super-deployment")).toBeInTheDocument();
  });
});
