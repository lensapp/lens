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

enum sortBy {
  name = "name",
  namespace = "namespace",
  minPods = "min-pods",
  maxPods = "max-pods",
  replicas = "replicas",
  age = "age",
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
        className="HorizontalPodAutoscalers" store={hpaStore}
        sortingCallbacks={{
          [sortBy.name]: (item: HorizontalPodAutoscaler) => item.getName(),
          [sortBy.namespace]: (item: HorizontalPodAutoscaler) => item.getNs(),
          [sortBy.minPods]: (item: HorizontalPodAutoscaler) => item.getMinPods(),
          [sortBy.maxPods]: (item: HorizontalPodAutoscaler) => item.getMaxPods(),
          [sortBy.replicas]: (item: HorizontalPodAutoscaler) => item.getReplicas()
        }}
        searchFilters={[
          (item: HorizontalPodAutoscaler) => item.getSearchFields()
        ]}
        renderHeaderTitle="Horizontal Pod Autoscalers"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Metrics", className: "metrics" },
          { title: "Min Pods", className: "min-pods", sortBy: sortBy.minPods },
          { title: "Max Pods", className: "max-pods", sortBy: sortBy.maxPods },
          { title: "Replicas", className: "replicas", sortBy: sortBy.replicas },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Status", className: "status" },
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
