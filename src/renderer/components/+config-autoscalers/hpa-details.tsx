import "./hpa-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeObjectDetailsProps, getDetailsUrl } from "../kube-object";
import { cssNames } from "../../utils";
import { HorizontalPodAutoscaler, HpaMetricType, IHpaMetric } from "../../api/endpoints/hpa.api";
import { KubeEventDetails } from "../+events/kube-event-details";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { lookupApiLink } from "../../api/kube-api";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

@observer
export class HpaDetails extends React.Component<Props> {
  renderMetrics() {
    const { object: hpa } = this.props;

    const renderName = (metric: IHpaMetric) => {
      switch (metric.type) {
        case HpaMetricType.Resource:
          const addition = metric.resource.targetAverageUtilization ? <>(as a percentage of request)</> : "";

          return <>Resource {metric.resource.name} on Pods {addition}</>;

        case HpaMetricType.Pods:
          return <>{metric.pods.metricName} on Pods</>;

        case HpaMetricType.Object:
          const { target } = metric.object;
          const { kind, name } = target;
          const objectUrl = getDetailsUrl(lookupApiLink(target, hpa));

          return (
            <>
              {metric.object.metricName} on{" "}
              <Link to={objectUrl}>{kind}/{name}</Link>
            </>
          );
        case HpaMetricType.External:
          return (
            <>
              {metric.external.metricName} on{" "}
              {JSON.stringify(metric.external.selector)}
            </>
          );
      }
    };

    return (
      <Table>
        <TableHead>
          <TableCell className="name">Name</TableCell>
          <TableCell className="metrics">Current / Target</TableCell>
        </TableHead>
        {
          hpa.getMetrics().map((metric, index) => {
            const name = renderName(metric);
            const values = hpa.getMetricValues(metric);

            return (
              <TableRow key={index}>
                <TableCell className="name">{name}</TableCell>
                <TableCell className="metrics">{values}</TableCell>
              </TableRow>
            );
          })
        }
      </Table>
    );
  }

  render() {
    const { object: hpa } = this.props;

    if (!hpa) return;
    const { scaleTargetRef } = hpa.spec;

    return (
      <div className="HpaDetails">
        <KubeObjectMeta object={hpa}/>

        <DrawerItem name="Reference">
          {scaleTargetRef && (
            <Link to={getDetailsUrl(lookupApiLink(scaleTargetRef, hpa))}>
              {scaleTargetRef.kind}/{scaleTargetRef.name}
            </Link>
          )}
        </DrawerItem>

        <DrawerItem name="Min Pods">
          {hpa.getMinPods()}
        </DrawerItem>

        <DrawerItem name="Max Pods">
          {hpa.getMaxPods()}
        </DrawerItem>

        <DrawerItem name="Replicas">
          {hpa.getReplicas()}
        </DrawerItem>

        <DrawerItem name="Status" labelsOnly>
          {hpa.getConditions().map(({ type, tooltip, isReady }) => {
            if (!isReady) return null;

            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            );
          })}
        </DrawerItem>

        <DrawerTitle title="Metrics"/>
        <div className="metrics">
          {this.renderMetrics()}
        </div>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "HorizontalPodAutoscaler",
  apiVersions: ["autoscaling/v2beta1"],
  components: {
    Details: (props) => <HpaDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "HorizontalPodAutoscaler",
  apiVersions: ["autoscaling/v2beta1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
