/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import podStoreInjectable from "../workloads-pods/store.injectable";
import replicasetsStoreInjectable from "../workloads-replicasets/store.injectable";
import type { ReplicaSetStore } from "../workloads-replicasets/store";
import { ReplicaSet, Pod } from "@k8slens/kube-object";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { Cluster } from "../../../common/cluster/cluster";

const runningReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "runningReplicaSet",
    resourceVersion: "runningReplicaSet",
    uid: "runningReplicaSet",
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/runningReplicaSet",
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
    selfLink: "/apis/apps/v1/replicasets/default/failedReplicaSet",
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
    selfLink: "/apis/apps/v1/replicasets/default/pendingReplicaSet",
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
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "running",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/foobar",
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
      uid: "pendingReplicaSet",
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "pending",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/foobar-pending",
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
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "failed",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/foobar-failed",
  },
  status: {
    phase: "Failed",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

describe("ReplicaSet Store tests", () => {
  let replicaSetStore: ReplicaSetStore;

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

    replicaSetStore = di.inject(replicasetsStoreInjectable);
    podStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
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
