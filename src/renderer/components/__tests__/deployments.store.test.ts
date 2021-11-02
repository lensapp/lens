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

import { observable } from "mobx";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { Deployment, Pod } from "../../../common/k8s-api/endpoints";

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
