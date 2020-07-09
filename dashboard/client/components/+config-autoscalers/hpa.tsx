import "./hpa.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { HpaRouteParams } from "./hpa.route";
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

interface Props extends RouteComponentProps<HpaRouteParams> {
}

@observer
export class HorizontalPodAutoscalers extends React.Component<Props> {
  getTargets(hpa: HorizontalPodAutoscaler): JSX.Element {
    const { metrics } = hpa.spec;
    const metricsRemainCount = metrics.length - 1;
    const metricsRemain = metrics.length > 1 ? <Trans>{metricsRemainCount} more...</Trans> : null;
    const metricValues = hpa.getMetricValues(metrics[0]);
    return <p>{metricValues} {metricsRemain && "+"}{metricsRemain}</p>;
  }

  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="HorizontalPodAutoscalers" store={hpaStore}
        sortingCallbacks={{
          [sortBy.name]: (item: HorizontalPodAutoscaler): string => item.getName(),
          [sortBy.namespace]: (item: HorizontalPodAutoscaler): string => item.getNs(),
          [sortBy.minPods]: (item: HorizontalPodAutoscaler): number => item.spec.minReplicas,
          [sortBy.maxPods]: (item: HorizontalPodAutoscaler): number => item.spec.maxReplicas,
          [sortBy.replicas]: (item: HorizontalPodAutoscaler): number => item.status.currentReplicas
        }}
        searchFilters={[
          (item: HorizontalPodAutoscaler): string[] => item.getSearchFields()
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
        renderTableContents={(hpa: HorizontalPodAutoscaler): (string | number | React.ReactNode)[] => [
          hpa.getName(),
          hpa.getNs(),
          this.getTargets(hpa),
          hpa.spec.minReplicas,
          hpa.spec.maxReplicas,
          hpa.status.currentReplicas,
          hpa.getAge(),
          hpa.getConditions().map(({ type, tooltip, isReady }) => {
            if (!isReady) {
              return null;
            }
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
        renderItemMenu={(item: HorizontalPodAutoscaler): JSX.Element => {
          return <HpaMenu object={item}/>;
        }}
      />
    );
  }
}

export function HpaMenu(props: KubeObjectMenuProps<HorizontalPodAutoscaler>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(hpaApi, {
  Menu: HpaMenu,
});
