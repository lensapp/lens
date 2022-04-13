/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hpa.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { HorizontalPodAutoscaler } from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api";
import { hpaStore } from "./hpa.store";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

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

@observer
export class HorizontalPodAutoscalers extends React.Component {
  getTargets(hpa: HorizontalPodAutoscaler) {
    const metrics = hpa.getMetrics();

    if (metrics.length === 0) {
      return <p>--</p>;
    }

    const metricsRemain = metrics.length > 1 ? `+${metrics.length - 1} more...` : "";

    return (
      <p>
        {hpa.getMetricValues(metrics[0])}
        {" "}
        {metricsRemain}
      </p>
    );
  }

  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="configuration_hpa"
          className="HorizontalPodAutoscalers"
          store={hpaStore}
          sortingCallbacks={{
            [columnId.name]: hpa => hpa.getName(),
            [columnId.namespace]: hpa => hpa.getNs(),
            [columnId.minPods]: hpa => hpa.getMinPods(),
            [columnId.maxPods]: hpa => hpa.getMaxPods(),
            [columnId.replicas]: hpa => hpa.getReplicas(),
            [columnId.age]: hpa => -hpa.getCreationTimestamp(),
          }}
          searchFilters={[
            hpa => hpa.getSearchFields(),
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
            this.getTargets(hpa),
            hpa.getMinPods(),
            hpa.getMaxPods(),
            hpa.getReplicas(),
            <KubeObjectAge key="age" object={hpa} />,
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
      </SiblingsInTabLayout>
    );
  }
}
