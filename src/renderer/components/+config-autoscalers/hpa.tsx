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

import "./hpa.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { HorizontalPodAutoscaler } from "../../../common/k8s-api/endpoints/hpa.api";
import { hpaStore } from "./hpa.store";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { HpaRouteParams } from "../../../common/routes";

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

interface Props extends RouteComponentProps<HpaRouteParams> {
}

@observer
export class HorizontalPodAutoscalers extends React.Component<Props> {
  getTargets(hpa: HorizontalPodAutoscaler) {
    const metrics = hpa.getMetrics();
    const metricsRemainCount = metrics.length - 1;
    const metricsRemain = metrics.length > 1 ? <>{metricsRemainCount} more...</> : null;
    const metricValues = hpa.getMetricValues(metrics[0]);

    return <p>{metricValues} {metricsRemain && "+"}{metricsRemain}</p>;
  }

  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="configuration_hpa"
        className="HorizontalPodAutoscalers" store={hpaStore}
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
          { title: "Status", className: "status", id: columnId.status },
        ]}
        renderTableContents={hpa => [
          hpa.getName(),
          <KubeObjectStatusIcon key="icon" object={hpa} />,
          hpa.getNs(),
          this.getTargets(hpa),
          hpa.getMinPods(),
          hpa.getMaxPods(),
          hpa.getReplicas(),
          hpa.getAge(),
          hpa.getConditions().map(({ type, tooltip, isReady }) => {
            if (!isReady) return null;

            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames(type.toLowerCase())}
                expandable={false}
              />
            );
          }),
        ]}
      />
    );
  }
}
