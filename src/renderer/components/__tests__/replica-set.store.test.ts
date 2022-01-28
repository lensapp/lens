/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PodStore } from "../+pods/store";
import { ReplicaSetStore } from "../+replica-sets/store";
import { ReplicaSet, Pod, PodApi, ReplicaSetApi } from "../../../common/k8s-api/endpoints";

const runningReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "runningReplicaSet",
    resourceVersion: "runningReplicaSet",
    uid: "runningReplicaSet",
    namespace: "default",
  },
});

const failedReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "failedReplicaSet",
    resourceVersion: "failedReplicaSet",
    uid: "failedReplicaSet",
    namespace: "default",
  },
});

const pendingReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "pendingReplicaSet",
    resourceVersion: "pendingReplicaSet",
    uid: "pendingReplicaSet",
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
      uid: "runningReplicaSet",
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
      uid: "pendingReplicaSet",
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
      uid: "failedReplicaSet",
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

describe("ReplicaSet Store tests", () => {
  let replicaSetStore: ReplicaSetStore;
  let podStore: PodStore;

  beforeEach(() => {
    podStore = new PodStore(new PodApi());

    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
    ]);

    replicaSetStore = new ReplicaSetStore(new ReplicaSetApi(), {
      podStore,
    });
  });

  it("gets ReplicaSet statuses in proper sorting order", () => {
    const statuses = Object.entries(replicaSetStore.getStatuses([
      failedReplicaSet,
      runningReplicaSet,
      pendingReplicaSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(replicaSetStore.getStatuses([runningReplicaSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(replicaSetStore.getStatuses([failedReplicaSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(replicaSetStore.getStatuses([pendingReplicaSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
