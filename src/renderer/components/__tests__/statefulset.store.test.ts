/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { StatefulSet, Pod } from "../../../common/k8s-api/endpoints";

const runningStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "runningStatefulSet",
    resourceVersion: "runningStatefulSet",
    uid: "runningStatefulSet",
    namespace: "default",
    selfLink: "/apis/apps/v1/statefulsets/default/runningStatefulSet",
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
    selfLink: "/apis/apps/v1/statefulsets/default/failedStatefulSet",
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
    selfLink: "/apis/apps/v1/statefulsets/default/pendingStatefulSet",
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
      apiVersion: "v1",
      kind: "StatefulSet",
      name: "running",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/statefulsets/default/foobar",
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
      uid: "pendingStatefulSet",
      apiVersion: "v1",
      kind: "StatefulSet",
      name: "pending",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/statefulsets/default/foobar-pending",
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
      apiVersion: "v1",
      kind: "StatefulSet",
      name: "failed",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/statefulsets/default/foobar-failed",
  },
  status: {
    phase: "Failed",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

describe("StatefulSet Store tests", () => {
  beforeAll(() => {
    // Add pods to pod store
    podsStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
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
