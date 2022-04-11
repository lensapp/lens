/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { DaemonSetStore } from "../+workloads-daemonsets/store";
import daemonSetStoreInjectable from "../+workloads-daemonsets/store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import { DaemonSet, Pod } from "../../../common/k8s-api/endpoints";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const runningDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "runningDaemonSet",
    resourceVersion: "runningDaemonSet",
    uid: "runningDaemonSet",
    namespace: "default",
    selfLink: "/apis/apps/v1/daemonsets/default/runningDaemonSet",
  },
});

const failedDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "failedDaemonSet",
    resourceVersion: "failedDaemonSet",
    uid: "failedDaemonSet",
    namespace: "default",
    selfLink: "/apis/apps/v1/daemonsets/default/failedDaemonSet",
  },
});

const pendingDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "pendingDaemonSet",
    resourceVersion: "pendingDaemonSet",
    uid: "pendingDaemonSet",
    namespace: "default",
    selfLink: "/apis/apps/v1/daemonsets/default/pendingDaemonSet",
  },
});

const runningPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    ownerReferences: [{
      uid: "runningDaemonSet",
      apiVersion: "apps/v1",
      kind: "DaemonSet",
      name: "running",
    }],
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
    ownerReferences: [{
      uid: "pendingDaemonSet",
      apiVersion: "apps/v1",
      kind: "DaemonSet",
      name: "pending",
    }],
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
    ownerReferences: [{
      uid: "failedDaemonSet",
      apiVersion: "apps/v1",
      kind: "DaemonSet",
      name: "failed",
    }],
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

describe("DaemonSet Store tests", () => {
  let daemonSetStore: DaemonSetStore;

  beforeAll(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);

    const podStore = di.inject(podStoreInjectable);

    daemonSetStore = di.inject(daemonSetStoreInjectable);
    podStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
  });

  it("gets DaemonSet statuses in proper sorting order", () => {
    const statuses = Object.entries(daemonSetStore.getStatuses([
      failedDaemonSet,
      runningDaemonSet,
      pendingDaemonSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(daemonSetStore.getStatuses([runningDaemonSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(daemonSetStore.getStatuses([failedDaemonSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(daemonSetStore.getStatuses([pendingDaemonSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
