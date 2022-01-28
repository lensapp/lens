/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PodStore } from "../+pods/store";
import { StatefulSetStore } from "../+stateful-sets/store";
import { StatefulSet, Pod, PodApi, StatefulSetApi } from "../../../common/k8s-api/endpoints";

const runningStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "runningStatefulSet",
    resourceVersion: "runningStatefulSet",
    uid: "runningStatefulSet",
    namespace: "default",
  },
});

const failedStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "failedStatefulSet",
    resourceVersion: "failedStatefulSet",
    uid: "failedStatefulSet",
    namespace: "default",
  },
});

const pendingStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "pendingStatefulSet",
    resourceVersion: "pendingStatefulSet",
    uid: "pendingStatefulSet",
    namespace: "default",
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
      uid: "runningStatefulSet",
      apiVersion: "",
      blockOwnerDeletion: false,
      controller: false,
      kind: "",
      name: "bar",
    }],
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
    ownerReferences: [{
      uid: "pendingStatefulSet",
      apiVersion: "",
      blockOwnerDeletion: false,
      controller: false,
      kind: "",
      name: "bar",
    }],
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
    ownerReferences: [{
      uid: "failedStatefulSet",
      apiVersion: "",
      blockOwnerDeletion: false,
      controller: false,
      kind: "",
      name: "bar",
    }],
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

describe("StatefulSet Store tests", () => {
  let statefulSetStore: StatefulSetStore;
  let podStore: PodStore;

  beforeEach(() => {
    podStore = new PodStore(new PodApi());

    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
    ]);

    statefulSetStore = new StatefulSetStore(new StatefulSetApi(), {
      podStore,
    });
  });

  it("gets StatefulSet statuses in proper sorting order", () => {
    const statuses = Object.entries(statefulSetStore.getStatuses([
      failedStatefulSet,
      runningStatefulSet,
      pendingStatefulSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(statefulSetStore.getStatuses([runningStatefulSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(statefulSetStore.getStatuses([failedStatefulSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(statefulSetStore.getStatuses([pendingStatefulSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
