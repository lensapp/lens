import "./hpa.scss"

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { IHpaRouteParams } from "./hpa.route";
import { HorizontalPodAutoscaler, hpaApi } from "../../api/endpoints/hpa.api";
import { hpaStore } from "./hpa.store";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { apiManager } from "../../api/api-manager";

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
    const metricsRemain = metrics.length > 1 ? <Trans>{metricsRemainCount} more...</Trans> : null;
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
        renderHeaderTitle={<Trans>Horizontal Pod Autoscalers</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Metrics</Trans>, className: "metrics" },
          { title: <Trans>Min Pods</Trans>, className: "min-pods", sortBy: sortBy.minPods },
          { title: <Trans>Max Pods</Trans>, className: "max-pods", sortBy: sortBy.maxPods },
          { title: <Trans>Replicas</Trans>, className: "replicas", sortBy: sortBy.replicas },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status" },
        ]}
        renderTableContents={(hpa: HorizontalPodAutoscaler) => [
          hpa.getName(),
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
            )
          })
        ]}
      />
    );
  }
}

