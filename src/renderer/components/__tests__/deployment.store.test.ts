/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { DeploymentStore } from "../+deployments/store";
import { PodStore } from "../+pods/store";
import { Deployment, DeploymentApi, Pod, PodApi } from "../../../common/k8s-api/endpoints";

const spec = {
  containers: [{
    name: "some",
    image: "someimage",
    resources: {
      requests: {
        cpu: "2",
        memory: "2Gi",
      },
    },
    terminationMessagePath: "test",
    terminationMessagePolicy: "test",
    imagePullPolicy: "test",
  }],
  restartPolicy: "restart",
  terminationGracePeriodSeconds: 1200,
  dnsPolicy: "dns",
  serviceAccountName: "test",
  serviceAccount: "test",
  securityContext: {},
  schedulerName: "test",
};

const runningDeployment = new Deployment({
  apiVersion: "foo",
  kind: "Deployment",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    namespace: "default",
  },
});

runningDeployment.spec = {
  replicas: 1,
  selector: { matchLabels: {}},
  strategy: {
    type: "test",
    rollingUpdate: {
      maxSurge: 1,
      maxUnavailable: 1,
    },
  },
  template: {
    metadata: {
      labels: {
        "name": "kube-state-metrics",
      },
    },
    spec,
  },
};

const failedDeployment = new Deployment({
  apiVersion: "foo",
  kind: "Deployment",
  metadata: {
    name: "failedDeployment",
    resourceVersion: "failedDeployment",
    uid: "failedDeployment",
    namespace: "default",
  },
});

failedDeployment.spec = {
  replicas: 1,
  selector: { matchLabels: {}},
  strategy: {
    type: "test",
    rollingUpdate: {
      maxSurge: 1,
      maxUnavailable: 1,
    },
  },
  template: {
    metadata: {
      labels: {
        "name": "failedpods",
      },
    },
    spec,
  },
};

const pendingDeployment = new Deployment({
  apiVersion: "foo",
  kind: "Deployment",
  metadata: {
    name: "pendingDeployment",
    resourceVersion: "pendingDeployment",
    uid: "pendingDeployment",
    namespace: "default",
  },
});

pendingDeployment.spec = {
  replicas: 1,
  selector: { matchLabels: {}},
  strategy: {
    type: "test",
    rollingUpdate: {
      maxSurge: 1,
      maxUnavailable: 1,
    },
  },
  template: {
    metadata: {
      labels: {
        "mydeployment": "true",
      },
    },
    spec,
  },
};

const runningPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    labels: {
      "name": "kube-state-metrics",
    },
    namespace: "default",
  },
});

runningPod.status = {
  phase: "Running",
  conditions: [
    {
      type: "Initialized",
      status: "True",
      lastProbeTime: 1,
      lastTransitionTime: "1",
    },
    {
      type: "Ready",
      status: "True",
      lastProbeTime: 1,
      lastTransitionTime: "1",
    },
  ],
  hostIP: "10.0.0.1",
  podIP: "10.0.0.1",
  startTime: "now",
  containerStatuses: [],
  initContainerStatuses: [],
};

const pendingPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-pending",
    resourceVersion: "foobar",
    uid: "foobar-pending",
    labels: {
      "mydeployment": "true",
    },
    namespace: "default",
  },
});

const failedPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-failed",
    resourceVersion: "foobar",
    uid: "foobar-failed",
    labels: {
      "name": "failedpods",
    },
    namespace: "default",
  },
});

failedPod.status = {
  phase: "Failed",
  conditions: [],
  hostIP: "10.0.0.1",
  podIP: "10.0.0.1",
  startTime: "now",
};

describe("Deployment Store tests", () => {
  let deploymentStore: DeploymentStore;
  let podStore: PodStore;

  beforeEach(() => {
    podStore = new PodStore(new PodApi());

    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
    ]);

    deploymentStore = new DeploymentStore(new DeploymentApi(), {
      podStore,
    });
  });

  it("gets Deployment statuses in proper sorting order", () => {
    const statuses = Object.entries(deploymentStore.getStatuses([
      failedDeployment,
      runningDeployment,
      pendingDeployment,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(deploymentStore.getStatuses([runningDeployment]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(deploymentStore.getStatuses([failedDeployment]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(deploymentStore.getStatuses([pendingDeployment]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
