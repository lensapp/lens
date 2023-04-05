/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";

export type ClusterOverviewUIBlock = {
  id: string;
  Component: React.ElementType;
  orderNumber: number;
};

export const clusterOverviewUIBlockInjectionToken = getInjectionToken<ClusterOverviewUIBlock>({
  id: "cluster-overview-ui-block-injection-token",
});

export type KubeObjectDetailMetricsComponentProps = {
  object: any;
};

export type KubeObjectDetailMetrics = {
  id: string;
  Component: React.ComponentType<KubeObjectDetailMetricsComponentProps>;
};

export const podDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "pod-details-metrics-injection-token",
});

export const deploymentDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "deployment-details-metrics-injection-token",
});

export const nodeDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "node-details-metrics-injection-token",
});

export const replicaSetDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "replica-set-details-metrics-injection-token",
});

export const persistentVolumeClaimDetailsMetricsInjectionToken =
  getInjectionToken<KubeObjectDetailMetrics>({
    id: "persistent-volume-claim-details-metrics-injection-token",
  });

export const statefulSetDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "stateful-set-details-metrics-injection-token",
});

export const namespaceDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "namespace-details-metrics-injection-token",
});

export interface PodDetailsContainerMetricsComponentProps {
  container: any;
  pod: any;
}

export interface PodDetailsContainerMetricsComponent {
  id: string;
  Component: React.ComponentType<PodDetailsContainerMetricsComponentProps>;
}

export const podDetailsContainerMetricsInjectionToken =
  getInjectionToken<PodDetailsContainerMetricsComponent>({
    id: "pod-details-container-metrics-injection-token",
  });
