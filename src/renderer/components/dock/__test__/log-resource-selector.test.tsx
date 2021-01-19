import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import selectEvent from "react-select-event";

import { Pod } from "../../../api/endpoints";
import { LogResourceSelector } from "../log-resource-selector";
import { LogTabData } from "../log-tab.store";

const dummyPod = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "dummyPod",
    name: "dummyPod",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default"
  },
  spec: {
    initContainers: [] as any,
    containers: [
      {
        name: "docker-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull"
      }
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  }
};

const anotherDummyPod = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "anotherDummyPod",
    name: "anotherDummyPod",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    ownerReferences: [{
      apiVersion: "v1",
      kind: "Deployment",
      name: "super-deployment",
      uid: "uuid",
      controller: true,
      blockOwnerDeletion: true,
    }]
  },
  spec: {
    initContainers: [
      {
        name: "init-node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull"
      },
      {
        name: "init-node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull"
      }
    ],
    containers: [
      {
        name: "node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull"
      },
      {
        name: "node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull"
      }
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  }
};

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
  const selectedPod = new Pod(dummyPod);

  return {
    pods: [] as Pod[],
    selectedPod,
    selectedContainer: selectedPod.getContainers()[0],
    containers: selectedPod.getContainers(),
    initContainers: selectedPod.getInitContainers(),
  };
};

const getFewPodsTabData = (): LogTabData => {
  const selectedPod = new Pod(anotherDummyPod);
  const anotherPod = new Pod(dummyPod);

  return {
    pods: [anotherPod],
    selectedPod,
    selectedContainer: selectedPod.getContainers()[0],
    containers: selectedPod.getContainers(),
    initContainers: selectedPod.getInitContainers(),
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

    expect(getByText("dummyPod")).toBeInTheDocument();
    expect(getByText("docker-exporter")).toBeInTheDocument();
  });

  it("renders sibling pods in dropdown", () => {
    const tabData = getFewPodsTabData();
    const { container, getByText } = render(getComponent(tabData));
    const podSelector: HTMLElement = container.querySelector(".pod-selector");

    selectEvent.openMenu(podSelector);

    expect(getByText("dummyPod")).toBeInTheDocument();
    expect(getByText("anotherDummyPod")).toBeInTheDocument();
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