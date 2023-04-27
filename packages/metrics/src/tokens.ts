/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";
import type {
  Container,
  DaemonSet,
  Deployment,
  Ingress,
  Job,
  KubeObject,
  Namespace,
  Node,
  PersistentVolumeClaim,
  Pod,
  ReplicaSet,
  StatefulSet,
} from "@k8slens/kube-object";

export type ClusterOverviewUIBlock = {
  id: string;
  Component: React.ElementType;
  orderNumber: number;
};

// this should be moved to cluster-overview package when there is one
export const clusterOverviewUIBlockInjectionToken = getInjectionToken<ClusterOverviewUIBlock>({
  id: "cluster-overview-ui-block-injection-token",
});

export type KubeObjectDetailMetricsComponentProps<K extends KubeObject> = {
  object: K;
};

export type KubeObjectDetailMetrics<K extends KubeObject> = {
  id: string;
  Component: React.ComponentType<KubeObjectDetailMetricsComponentProps<K>>;
};

export const podDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Pod>>({
  id: "pod-details-metrics-injection-token",
});

export const deploymentDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Deployment>>({
  id: "deployment-details-metrics-injection-token",
});

export const nodeDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Node>>({
  id: "node-details-metrics-injection-token",
});

export const replicaSetDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<ReplicaSet>>({
  id: "replica-set-details-metrics-injection-token",
});

export const persistentVolumeClaimDetailsMetricsInjectionToken = getInjectionToken<
  KubeObjectDetailMetrics<PersistentVolumeClaim>
>({
  id: "persistent-volume-claim-details-metrics-injection-token",
});

export const statefulSetDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<StatefulSet>>({
  id: "stateful-set-details-metrics-injection-token",
});

export const namespaceDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Namespace>>({
  id: "namespace-details-metrics-injection-token",
});

export const jobDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Job>>({
  id: "job-details-metrics-injection-token",
});

export const daemonSetDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<DaemonSet>>({
  id: "daemon-set-details-metrics-injection-token",
});

export const ingressDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics<Ingress>>({
  id: "ingress-details-metrics-injection-token",
});

export interface PodDetailsContainerMetricsComponentProps {
  container: Container;
  pod: Pod;
}

export interface PodDetailsContainerMetricsComponent {
  id: string;
  Component: React.ComponentType<PodDetailsContainerMetricsComponentProps>;
}

export const podDetailsContainerMetricsInjectionToken = getInjectionToken<PodDetailsContainerMetricsComponent>({
  id: "pod-details-container-metrics-injection-token",
});
