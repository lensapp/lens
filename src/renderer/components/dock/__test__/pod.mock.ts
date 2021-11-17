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

import type { IPodContainer } from "../../../../common/k8s-api/endpoints";

export const noOwnersPod = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    uid: "dockerExporter",
    name: "dockerExporter",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
  },
  spec: {
    initContainers: [] as IPodContainer[],
    containers: [
      {
        name: "docker-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  },
};

export const dockerPod = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    uid: "dockerExporter",
    name: "dockerExporter",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    ownerReferences: [
      {
        uid: "dockerExporterOwner",
      },
    ],
  },
  spec: {
    initContainers: [] as IPodContainer[],
    containers: [
      {
        name: "docker-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  },
};

export const deploymentPod1 = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod1",
    name: "deploymentPod1",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    ownerReferences: [{
      apiVersion: "v1",
      kind: "Deployment",
      name: "super-deployment",
      uid: "uuid",
      controller: true,
      blockOwnerDeletion: true,
    }],
  },
  spec: {
    initContainers: [
      {
        name: "init-node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
      {
        name: "init-node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    containers: [
      {
        name: "node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
      {
        name: "node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  },
};

export const deploymentPod2 = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod2",
    name: "deploymentPod2",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    ownerReferences: [{
      apiVersion: "v1",
      kind: "Deployment",
      name: "super-deployment",
      uid: "uuid",
      controller: true,
      blockOwnerDeletion: true,
    }],
  },
  spec: {
    initContainers: [
      {
        name: "init-node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
      {
        name: "init-node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    containers: [
      {
        name: "node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
      {
        name: "node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  },
};

export const deploymentPod3 = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod3",
    name: "deploymentPod3",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    ownerReferences: [{
      apiVersion: "v1",
      kind: "Deployment",
      name: "super-deployment",
      uid: "uuid",
      controller: true,
      blockOwnerDeletion: true,
    }],
  },
  spec: {
    containers: [
      {
        name: "node-exporter",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
      {
        name: "node-exporter-1",
        image: "docker.io/prom/node-exporter:v1.0.0-rc.0",
        imagePullPolicy: "pull",
      },
    ],
    serviceAccountName: "dummy",
    serviceAccount: "dummy",
  },
  status: {
    phase: "Running",
    conditions: [{
      type: "Running",
      status: "Running",
      lastProbeTime: 1,
      lastTransitionTime: "Some time",
    }],
    hostIP: "dummy",
    podIP: "dummy",
    startTime: "dummy",
  },
};
