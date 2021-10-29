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
