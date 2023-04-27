/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { DeploymentStore } from "../workloads-deployments/store";
import deploymentStoreInjectable from "../workloads-deployments/store.injectable";
import podStoreInjectable from "../workloads-pods/store.injectable";
import type { PodSpec } from "@k8slens/kube-object";
import { Deployment, Pod } from "@k8slens/kube-object";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { Cluster } from "../../../common/cluster/cluster";

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
    terminationMessagePolicy: "File",
    imagePullPolicy: "Always",
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
  let deploymentStore: DeploymentStore;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    const podStore = di.inject(podStoreInjectable);

    // Add pods to pod store
    podStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
    deploymentStore = di.inject(deploymentStoreInjectable);
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
