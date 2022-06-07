/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Pod } from "../../../../../common/k8s-api/endpoints";

export const dockerPod = new Pod({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "dockerExporter",
    name: "dockerExporter",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/v1/pod/default/dockerExporter",
  },
  spec: {
    initContainers: [],
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
});

export const deploymentPod1 = new Pod({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod1",
    name: "deploymentPod1",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/v1/pod/default/deploymentPod1",
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
});

export const deploymentPod2 = new Pod({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod2",
    name: "deploymentPod2",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/v1/pod/default/deploymentPod2",
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
});

export const deploymentPod3 = new Pod({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "deploymentPod3",
    name: "deploymentPod3",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/v1/pod/default/deploymentPod3",
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
});
