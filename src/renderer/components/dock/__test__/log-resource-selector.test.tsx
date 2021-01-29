/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import selectEvent from "react-select-event";

import { Pod } from "../../../api/endpoints";
import { LogResourceSelector } from "../log-resource-selector";
import { LogTabData } from "../log-tab.store";
import { dockerPod, deploymentPod1 } from "./pod.mock";

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
