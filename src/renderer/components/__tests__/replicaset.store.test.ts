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
import { podsStore } from "../+workloads-pods/pods.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { ReplicaSet, Pod } from "../../../common/k8s-api/endpoints";

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
  beforeAll(() => {
    podsStore.items = observable.array([
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
