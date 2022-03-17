/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { podsStore } from "../+workloads-pods/pods.store";
import type { PodSpec } from "../../../common/k8s-api/endpoints";
import { Deployment, Pod } from "../../../common/k8s-api/endpoints";

const spec: PodSpec = {
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
    selfLink: "/apis/apps/v1/deployments/default/foobar",
  },
  spec: {
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
  },
});

const failedDeployment = new Deployment({
  apiVersion: "foo",
  kind: "Deployment",
  metadata: {
    name: "failedDeployment",
    resourceVersion: "failedDeployment",
    uid: "failedDeployment",
    namespace: "default",
    selfLink: "/apis/apps/v1/deployments/default/failedDeployment",
  },
  spec: {
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
  },
});

const pendingDeployment = new Deployment({
  apiVersion: "foo",
  kind: "Deployment",
  metadata: {
    name: "pendingDeployment",
    resourceVersion: "pendingDeployment",
    uid: "pendingDeployment",
    namespace: "default",
    selfLink: "/apis/apps/v1/deployments/default/pendingDeployment",
  },
  spec: {
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
  },
});

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
    selfLink: "/api/v1/pods/default/foobar",
  },
  status: {
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
  },
});

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
    selfLink: "/api/v1/pods/default/foobar-pending",
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
    selfLink: "/api/v1/pods/default/foobar-failed",
  },
  status: {
    phase: "Failed",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

describe("Deployment Store tests", () => {
  beforeAll(() => {
    // Add pods to pod store
    podsStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
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
