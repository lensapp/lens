/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hpa.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { HorizontalPodAutoscaler } from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api";
import type { HorizontalPodAutoscalerStore } from "./store";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { HpaRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import horizontalPodAutoscalerStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  metrics = "metrics",
  minPods = "min-pods",
  maxPods = "max-pods",
  replicas = "replicas",
  age = "age",
  status = "status",
}

export interface HorizontalPodAutoscalersProps extends RouteComponentProps<HpaRouteParams> {
}

interface Dependencies {
  horizontalPodAutoscalerStore: HorizontalPodAutoscalerStore;
}

const NonInjectedHorizontalPodAutoscalers = observer(({ horizontalPodAutoscalerStore }: Dependencies & HorizontalPodAutoscalersProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="configuration_hpa"
    className="HorizontalPodAutoscalers"
    store={horizontalPodAutoscalerStore}
    sortingCallbacks={{
      [columnId.name]: item => item.getName(),
      [columnId.namespace]: item => item.getNs(),
      [columnId.minPods]: item => item.getMinPods(),
      [columnId.maxPods]: item => item.getMaxPods(),
      [columnId.replicas]: item => item.getReplicas(),
      [columnId.age]: item => item.getTimeDiffFromNow(),
    }}
    searchFilters={[
      item => item.getSearchFields(),
    ]}
    renderHeaderTitle="Horizontal Pod Autoscalers"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Metrics", className: "metrics", id: columnId.metrics },
      { title: "Min Pods", className: "min-pods", sortBy: columnId.minPods, id: columnId.minPods },
      { title: "Max Pods", className: "max-pods", sortBy: columnId.maxPods, id: columnId.maxPods },
      { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Status", className: "status scrollable", id: columnId.status },
    ]}
    renderTableContents={hpa => [
      hpa.getName(),
      <KubeObjectStatusIcon key="icon" object={hpa} />,
      hpa.getNs(),
      getTargets(hpa),
      hpa.getMinPods(),
      hpa.getMaxPods(),
      hpa.getReplicas(),
      hpa.getAge(),
      hpa.getConditions()
        .filter(({ isReady }) => isReady)
        .map(({ type, tooltip }) => (
          <Badge
            key={type}
            label={type}
            tooltip={tooltip}
            className={cssNames(type.toLowerCase())}
            expandable={false}
            scrollable={true}
          />
        )),
    ]}
  />
));

export const HorizontalPodAutoscalers = withInjectables<Dependencies, HorizontalPodAutoscalersProps>(NonInjectedHorizontalPodAutoscalers, {
  getProps: (di, props) => ({
    horizontalPodAutoscalerStore: di.inject(horizontalPodAutoscalerStoreInjectable),
    ...props,
  }),
});

function getTargets(hpa: HorizontalPodAutoscaler): string {
  const metrics = hpa.getMetrics();

  switch (metrics.length) {
    case 0:
      return "--";
    case 1:
      return hpa.getMetricValues(metrics[0]);
    default:
      return `${hpa.getMetricValues(metrics[0])} +${metrics.length - 1} more...`;
  }
}
