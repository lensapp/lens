/**
 * @jest-environment jsdom
 */

import { podsStore } from "../../+workloads-pods/pods.store";
import { Pod } from "../../../api/endpoints";
import { dockStore } from "../dock.store";
import { LogTabStore } from "../log-tab.store";

let logTabStore: LogTabStore = null;

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

const deploymentPod1 = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod1",
    name: "deploymentPod1",
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

const deploymentPod2 = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod2",
    name: "deploymentPod2",
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

podsStore.items.push(new Pod(dummyPod));
podsStore.items.push(new Pod(deploymentPod1));
podsStore.items.push(new Pod(deploymentPod2));

describe("log tab store", () => {
  beforeEach(async () => {
    logTabStore = new LogTabStore();
  });

  it("creates log tab without sibling pods", () => {
    const selectedPod = new Pod(dummyPod);
    const selectedContainer = selectedPod.getAllContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod],
      selectedPod,
      selectedContainer,
      containers: selectedPod.getContainers(),
      initContainers: [],
      showTimestamps: false,
      previous: false
    });
  });

  it("creates log tab with sibling pods", () => {
    const selectedPod = new Pod(deploymentPod1);
    const siblingPod = new Pod(deploymentPod2);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod, siblingPod],
      selectedPod,
      selectedContainer,
      containers: selectedPod.getContainers(),
      initContainers: selectedPod.getInitContainers(),
      showTimestamps: false,
      previous: false
    });
  });
});