import "./hpa.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { IHpaRouteParams } from "./hpa.route";
import { HorizontalPodAutoscaler } from "../../api/endpoints/hpa.api";
import { hpaStore } from "./hpa.store";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  metrics = "metrics",
  minPods = "min-pods",
  maxPods = "max-pods",
  replicas = "replicas",
  age = "age",
  status = "status"
}

interface Props extends RouteComponentProps<IHpaRouteParams> {
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
          [columnId.name]: (item: HorizontalPodAutoscaler) => item.getName(),
          [columnId.namespace]: (item: HorizontalPodAutoscaler) => item.getNs(),
          [columnId.minPods]: (item: HorizontalPodAutoscaler) => item.getMinPods(),
          [columnId.maxPods]: (item: HorizontalPodAutoscaler) => item.getMaxPods(),
          [columnId.replicas]: (item: HorizontalPodAutoscaler) => item.getReplicas()
        }}
        searchFilters={[
          (item: HorizontalPodAutoscaler) => item.getSearchFields()
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
        renderTableContents={(hpa: HorizontalPodAutoscaler) => [
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
              />
            );
          })
        ]}
      />
    );
  }
}
